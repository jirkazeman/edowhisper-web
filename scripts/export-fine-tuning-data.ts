#!/usr/bin/env tsx

/**
 * Export Fine-Tuning Data Script
 * 
 * Tento skript exportuje ohodnocené záznamy z databáze
 * do formátu vhodného pro OpenAI fine-tuning.
 * 
 * Použití:
 *   npx tsx scripts/export-fine-tuning-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface FineTuningRecord {
  id: string;
  llm_original: any;
  form_data: any;
  quality_rating: number;
  hygienist_feedback?: string;
  rated_at: string;
}

async function exportFineTuningData() {
  console.log("🚀 Exportuji data pro fine-tuning...\n");

  // 1. Načti všechny ohodnocené záznamy
  const { data: records, error } = await supabase
    .from("paro_records")
    .select("*")
    .not("llm_original", "is", null)
    .not("quality_rating", "is", null)
    .order("rated_at", { ascending: false });

  if (error) {
    console.error("❌ Chyba při načítání záznamů:", error);
    process.exit(1);
  }

  if (!records || records.length === 0) {
    console.log("⚠️  Žádné ohodnocené záznamy nenalezeny.");
    console.log("💡 Nejdříve nechte hygienistky ohodnotit záznamy v aplikaci.");
    process.exit(0);
  }

  console.log(`📊 Nalezeno ${records.length} ohodnocených záznamů\n`);

  // 2. Statistiky
  const stats = {
    total: records.length,
    excellent: records.filter(r => r.quality_rating === 5).length,
    good: records.filter(r => r.quality_rating === 4).length,
    average: records.filter(r => r.quality_rating === 3).length,
    poor: records.filter(r => r.quality_rating === 2).length,
    veryPoor: records.filter(r => r.quality_rating === 1).length,
    avgRating: (records.reduce((sum, r) => sum + r.quality_rating, 0) / records.length).toFixed(2),
    withFeedback: records.filter(r => r.hygienist_feedback).length,
  };

  console.log("📈 Statistiky hodnocení:");
  console.log(`   ⭐⭐⭐⭐⭐ Vynikající (5): ${stats.excellent}`);
  console.log(`   ⭐⭐⭐⭐   Dobré (4):      ${stats.good}`);
  console.log(`   ⭐⭐⭐     Průměrné (3):  ${stats.average}`);
  console.log(`   ⭐⭐       Špatné (2):    ${stats.poor}`);
  console.log(`   ⭐         Velmi špatné (1): ${stats.veryPoor}`);
  console.log(`   📊 Průměrné hodnocení: ${stats.avgRating}/5`);
  console.log(`   💬 Záznamy se zpětnou vazbou: ${stats.withFeedback}/${stats.total}\n`);

  // 3. Filtruj záznamy pro fine-tuning
  // Doporučení: Použít jen kvalitní záznamy (rating >= 4)
  const highQualityRecords = records.filter(r => r.quality_rating >= 4);
  
  console.log(`✅ Pro fine-tuning použijeme ${highQualityRecords.length} kvalitních záznamů (rating >= 4)\n`);

  if (highQualityRecords.length < 10) {
    console.log("⚠️  VAROVÁNÍ: Málo dat pro fine-tuning!");
    console.log("💡 Doporučujeme minimálně 100-200 kvalitních záznamů.");
    console.log("   Pokračujte ve sběru hodnocení před spuštěním fine-tuningu.\n");
  }

  // 4. Převést do OpenAI formátu
  const trainingExamples = highQualityRecords.map(record => {
    const transcript = record.llm_original?.transcript || 
                      record.llm_original?.user_prompt ||
                      record.form_data?.fullTranscript ||
                      ""; // Upravte podle vaší struktury dat

    return {
      messages: [
        {
          role: "system",
          content: getSystemPrompt(), // Váš system prompt
        },
        {
          role: "user",
          content: transcript,
        },
        {
          role: "assistant",
          content: JSON.stringify(record.form_data),
        },
      ],
      // Metadata pro debugging (OpenAI ignoruje)
      metadata: {
        record_id: record.id,
        quality_rating: record.quality_rating,
        hygienist_feedback: record.hygienist_feedback,
        rated_at: record.rated_at,
      },
    };
  });

  // 5. Export do JSONL souboru
  const outputDir = path.join(process.cwd(), "exports");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = path.join(outputDir, `fine-tuning-data-${timestamp}.jsonl`);
  const metadataFile = path.join(outputDir, `fine-tuning-metadata-${timestamp}.json`);

  // JSONL formát (každý řádek = jeden JSON objekt)
  const jsonlContent = trainingExamples
    .map(example => {
      // Odstraň metadata pro OpenAI export
      const { metadata, ...openaiExample } = example;
      return JSON.stringify(openaiExample);
    })
    .join("\n");

  fs.writeFileSync(outputFile, jsonlContent);
  
  // Samostatný metadata soubor pro vaši referenci
  fs.writeFileSync(
    metadataFile,
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        stats,
        records: trainingExamples.map(ex => ex.metadata),
      },
      null,
      2
    )
  );

  console.log("✅ Export dokončen!\n");
  console.log(`📁 Fine-tuning data: ${outputFile}`);
  console.log(`📁 Metadata: ${metadataFile}\n`);

  // 6. Další kroky
  console.log("🚀 Další kroky pro fine-tuning:");
  console.log("   1. Nahrajte soubor na OpenAI:");
  console.log(`      openai api files create -f ${outputFile} -p fine-tune`);
  console.log("");
  console.log("   2. Spusťte fine-tuning job:");
  console.log("      openai api fine_tunes.create -t <FILE_ID> -m gpt-4o-mini-2024-07-18");
  console.log("");
  console.log("   3. Sledujte progress:");
  console.log("      openai api fine_tunes.follow -i <FINE_TUNE_ID>");
  console.log("");
  console.log("📚 Dokumentace: https://platform.openai.com/docs/guides/fine-tuning\n");

  // 7. Validace dat
  console.log("🔍 Validuji exportovaná data...");
  const validation = validateTrainingData(trainingExamples);
  
  if (validation.errors.length > 0) {
    console.log("\n⚠️  Nalezeny problémy:");
    validation.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log("   ✅ Všechna data jsou validní!");
  }

  console.log("\n✨ Hotovo!");
}

function getSystemPrompt(): string {
  // Upravte podle vašeho use case
  return `Jsi profesionální parodontální asistentka v české zubní ordinaci.
Tvým úkolem je vyplnit parodontální záznam pacienta na základě audio transkriptu z vyšetření.

Extrahuj a strukturuj následující informace:
- Základní údaje pacienta (jméno, rodné číslo, věk)
- Anamnézu (obecnou, stomatologickou, alergie, medikace)
- Vyšetření (hygiena, dásně, zubní kámen, nálezy)
- PBI (Papilla Bleeding Index)
- CPITN (Community Periodontal Index)
- Zubní schéma
- Diagnózu a doporučení

Odpovídej ve formátu JSON s českou terminologií.
Buď přesná, odborná a úplná.`;
}

function validateTrainingData(examples: any[]): { errors: string[] } {
  const errors: string[] = [];

  examples.forEach((example, idx) => {
    // Kontrola struktury
    if (!example.messages || !Array.isArray(example.messages)) {
      errors.push(`Záznam ${idx + 1}: Chybí pole 'messages'`);
      return;
    }

    if (example.messages.length !== 3) {
      errors.push(`Záznam ${idx + 1}: Očekávány 3 messages (system, user, assistant)`);
    }

    // Kontrola rolí
    const roles = example.messages.map((m: any) => m.role);
    if (roles[0] !== "system" || roles[1] !== "user" || roles[2] !== "assistant") {
      errors.push(`Záznam ${idx + 1}: Nesprávné role messages`);
    }

    // Kontrola prázdného obsahu
    example.messages.forEach((msg: any, msgIdx: number) => {
      if (!msg.content || msg.content.trim() === "") {
        errors.push(`Záznam ${idx + 1}, Message ${msgIdx + 1}: Prázdný obsah`);
      }
    });

    // Kontrola délky (OpenAI limity)
    const totalLength = example.messages.reduce(
      (sum: number, msg: any) => sum + msg.content.length,
      0
    );
    if (totalLength > 50000) {
      errors.push(`Záznam ${idx + 1}: Příliš dlouhý (${totalLength} znaků, max 50000)`);
    }
  });

  return { errors };
}

// Spusť export
exportFineTuningData().catch(console.error);

