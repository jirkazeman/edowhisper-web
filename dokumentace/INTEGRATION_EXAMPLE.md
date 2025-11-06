# 🔌 Integrace s existujícím kódem

Praktické příklady, jak integrovat systém hodnocení do vaší aplikace.

## 📍 Kde ukládat `llm_original`?

Hledejte místa v kódu, kde:
1. Voláte OpenAI API
2. Zpracováváte audio transkript
3. Vytváříte nový `paro_record`

---

## 🎯 Příklad 1: Základní integrace

### Před:

```typescript
// Starý kód - bez ukládání původního AI výstupu
async function createRecordFromAI(transcript: string, userId: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript }
    ]
  });

  const formData = JSON.parse(response.choices[0].message.content);
  
  // Vytvoř záznam
  return await recordsAPI.create(formData, userId);
}
```

### Po (s fine-tuning supportem):

```typescript
// Nový kód - ukládá původní AI výstup
async function createRecordFromAI(transcript: string, userId: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript }
    ]
  });

  const aiOutput = response.choices[0].message.content;
  const formData = JSON.parse(aiOutput);
  
  // 🔥 Uložit původní AI výstup pro fine-tuning
  const llmOriginal = {
    raw_response: aiOutput,
    model: response.model,
    transcript: transcript,
    system_prompt: systemPrompt,
    timestamp: new Date().toISOString(),
    usage: {
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens,
    }
  };
  
  // Vytvoř záznam s původním AI výstupem
  return await recordsAPI.create(formData, userId, llmOriginal);
}
```

---

## 🎯 Příklad 2: Integrace s audio zpracováním

```typescript
// Handler pro nahrání audio souboru
async function handleAudioUpload(audioFile: File, userId: string) {
  try {
    // 1. Transkripce audio
    const transcript = await transcribeAudio(audioFile);
    
    // 2. AI zpracování transkriptu
    const aiResponse = await processWithAI(transcript);
    
    // 3. Vytvoření záznamu s llm_original
    const record = await createRecordWithFineTuning(
      aiResponse.formData,
      aiResponse.llmOriginal,
      userId
    );
    
    return record;
  } catch (error) {
    console.error("Chyba při zpracování audio:", error);
    throw error;
  }
}

async function transcribeAudio(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  const result = await response.json();
  return result.text;
}

async function processWithAI(transcript: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Jsi parodontální asistentka. Vyplň strukturovaný záznam z transkriptu..."
      },
      {
        role: "user",
        content: transcript
      }
    ],
    response_format: { type: "json_object" }
  });

  const aiOutput = completion.choices[0].message.content;
  
  return {
    formData: JSON.parse(aiOutput),
    llmOriginal: {
      raw_response: aiOutput,
      model: completion.model,
      transcript: transcript,
      timestamp: new Date().toISOString(),
      usage: completion.usage
    }
  };
}

async function createRecordWithFineTuning(
  formData: RecordFormData,
  llmOriginal: any,
  userId: string
) {
  return await recordsAPI.create(formData, userId, llmOriginal);
}
```

---

## 🎯 Příklad 3: API route pro upload audio

```typescript
// app/api/process-audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { recordsAPI } from "@/lib/api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const userId = formData.get("userId") as string;

    if (!audioFile || !userId) {
      return NextResponse.json(
        { error: "Missing audio file or userId" },
        { status: 400 }
      );
    }

    // 1. Transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "cs",
    });

    const transcript = transcription.text;

    // 2. Process with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiOutput = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiOutput || "{}");

    // 3. Create record with llm_original
    const llmOriginal = {
      raw_response: aiOutput,
      model: completion.model,
      transcript: transcript,
      system_prompt: getSystemPrompt(),
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      audio_duration_seconds: transcription.duration,
    };

    const record = await recordsAPI.create(parsedData, userId, llmOriginal);

    return NextResponse.json({
      success: true,
      record: record,
      transcript: transcript,
    });
  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process audio" },
      { status: 500 }
    );
  }
}

function getSystemPrompt(): string {
  return `Jsi profesionální parodontální asistentka v české zubní ordinaci.
Tvým úkolem je vyplnit parodontální záznam pacienta na základě audio transkriptu.

Extrahuj a strukturuj následující informace:
- Základní údaje pacienta
- Anamnézu
- Vyšetření
- PBI a CPITN indexy
- Zubní schéma
- Diagnózu a doporučení

Odpovídaj výhradně ve formátu JSON.`;
}
```

---

## 🎯 Příklad 4: React hook pro vytvoření záznamu

```typescript
// hooks/useCreateRecord.ts
import { useState } from "react";
import { recordsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { RecordFormData } from "@/lib/types";

interface UseCreateRecordResult {
  createRecord: (formData: RecordFormData, llmOriginal?: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useCreateRecord(): UseCreateRecordResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecord = async (formData: RecordFormData, llmOriginal?: any) => {
    if (!user) {
      setError("Není přihlášen žádný uživatel");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await recordsAPI.create(formData, user.id, llmOriginal);
    } catch (err: any) {
      setError(err.message || "Nepodařilo se vytvořit záznam");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRecord, loading, error };
}

// Použití v komponentě:
function MyComponent() {
  const { createRecord, loading, error } = useCreateRecord();

  const handleSubmit = async () => {
    const formData = { /* ... */ };
    const llmOriginal = { /* původní AI výstup */ };
    
    await createRecord(formData, llmOriginal);
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? "Ukládám..." : "Vytvořit záznam"}
    </button>
  );
}
```

---

## 🎯 Příklad 5: Streaming AI odpověď (pokročilé)

```typescript
// Pro aplikace, které používají streaming
async function processTranscriptWithStreaming(transcript: string, userId: string) {
  let fullResponse = "";
  let formData: RecordFormData | null = null;

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript }
    ],
    stream: true,
  });

  // Sbírej streaming odpověď
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullResponse += content;
    
    // Real-time update UI (volitelné)
    updateUIWithPartialResponse(fullResponse);
  }

  // Parse finální odpověď
  formData = JSON.parse(fullResponse);

  // Uložit s původním výstupem
  const llmOriginal = {
    raw_response: fullResponse,
    model: "gpt-4",
    transcript: transcript,
    timestamp: new Date().toISOString(),
    streaming: true,
  };

  return await recordsAPI.create(formData, userId, llmOriginal);
}
```

---

## 🎯 Příklad 6: Batch processing (hromadné zpracování)

```typescript
// Pro zpracování více záznamů najednou
async function batchProcessTranscripts(
  transcripts: string[],
  userId: string
) {
  const results = [];

  for (const transcript of transcripts) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript }
        ],
      });

      const aiOutput = completion.choices[0].message.content;
      const formData = JSON.parse(aiOutput);

      const llmOriginal = {
        raw_response: aiOutput,
        model: completion.model,
        transcript: transcript,
        timestamp: new Date().toISOString(),
        batch_processing: true,
      };

      const record = await recordsAPI.create(formData, userId, llmOriginal);
      results.push({ success: true, record });
    } catch (error) {
      results.push({ success: false, error });
    }

    // Rate limiting
    await sleep(1000);
  }

  return results;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 🔍 Debugging

### Ověřte, že se data ukládají:

```sql
-- V Supabase SQL Editor
SELECT 
  id,
  created_at,
  llm_original IS NOT NULL as has_llm_data,
  form_data->>'lastName' as patient_name
FROM paro_records
ORDER BY created_at DESC
LIMIT 10;
```

### Zkontrolujte velikost dat:

```sql
SELECT 
  id,
  pg_size_pretty(length(llm_original::text)::bigint) as llm_size,
  pg_size_pretty(length(form_data::text)::bigint) as form_size
FROM paro_records
WHERE llm_original IS NOT NULL
LIMIT 10;
```

---

## 🚨 Časté chyby

### ❌ Chyba 1: Neuložili jste transcript

```typescript
// ŠPATNĚ:
const llmOriginal = {
  raw_response: aiOutput,
  // Chybí transcript!
};
```

```typescript
// SPRÁVNĚ:
const llmOriginal = {
  raw_response: aiOutput,
  transcript: transcript, // ✅ Důležité pro fine-tuning!
};
```

### ❌ Chyba 2: Uložení jen textu místo objektu

```typescript
// ŠPATNĚ:
await recordsAPI.create(formData, userId, aiOutput); // string
```

```typescript
// SPRÁVNĚ:
await recordsAPI.create(formData, userId, {
  raw_response: aiOutput,
  model: "gpt-4",
  // ... další metadata
});
```

### ❌ Chyba 3: Zapomněli jste na system prompt

```typescript
// ŠPATNĚ:
const llmOriginal = {
  raw_response: aiOutput,
  transcript: transcript,
  // Chybí system_prompt!
};
```

```typescript
// SPRÁVNĚ:
const llmOriginal = {
  raw_response: aiOutput,
  transcript: transcript,
  system_prompt: systemPrompt, // ✅ Pro rekonstrukci promptu
};
```

---

## ✅ Checklist pro integraci

- [ ] Našli jste místo, kde se volá OpenAI API
- [ ] Ukládáte `raw_response` (původní AI výstup)
- [ ] Ukládáte `transcript` (původní vstup)
- [ ] Ukládáte `system_prompt` (pokud se mění)
- [ ] Ukládáte `model` (název modelu)
- [ ] Ukládáte `timestamp`
- [ ] Ukládáte `usage` (token counts)
- [ ] Předáváte `llmOriginal` do `recordsAPI.create()`
- [ ] Testovali jste, že se data ukládají
- [ ] Ověřili jste v databázi

---

**Pokud potřebujete pomoc, dejte vědět! 🚀**

