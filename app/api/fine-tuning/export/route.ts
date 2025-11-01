import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { ParoRecord } from "@/lib/types";

/**
 * Export Fine-Tuning Data API Endpoint
 * 
 * Exportuje ohodnocené záznamy do OpenAI fine-tuning formátu (JSONL)
 */

function getSystemPrompt(): string {
  return `Jsi profesionální parodontální asistentka v české zubní ordinaci.
Tvým úkolem je vyplnit parodontální záznam pacienta na základě audio transkriptu z vyšetření.

Extrahuj a strukturuj následující informace:
- Základní údaje pacienta (jméno, příjmení, rodné číslo, věk, pohlaví, kontakt)
- Adresu (ulice, číslo popisné, město, PSČ)
- Anamnézu (obecnou, stomatologickou, alergie, medikace)
- Vyšetření (hygiena, dásně, zubní kámen, nálezy)
- PBI (Papilla Bleeding Index) - hodnoty pro jednotlivé kvadranty a celkový index
- CPITN (Community Periodontal Index) - hodnoty pro jednotlivé sextanty
- Zubní schéma (stav jednotlivých zubů)
- Diagnózu, plán léčby a doporučení

Odpovídej ve formátu JSON s českou terminologií.
Buď přesná, odborná a úplná. Vyplň pouze údaje, které jsou v transkriptu zmíněny.`;
}

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // 1. Načti ohodnocené záznamy s rating >= 4
    const { data: records, error } = await supabaseAdmin
      .from("paro_records")
      .select("*")
      .not("llm_original", "is", null)
      .gte("quality_rating", 4) // Pouze kvalitní záznamy
      .eq("deleted", false)
      .order("rated_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "Žádné kvalitní záznamy k exportu. Ohodnoťte záznamy hodnocením 4 nebo 5." },
        { status: 400 }
      );
    }

    // 2. Převést do OpenAI formátu
    const trainingExamples = records.map((record: ParoRecord) => {
      // Najdi transkript v různých možných místech
      const transcript =
        record.llm_original?.transcript ||
        record.llm_original?.user_prompt ||
        record.llm_original?.input ||
        record.form_data?.fullTranscript ||
        "";

      if (!transcript || transcript.trim() === "") {
        console.warn(`Record ${record.id} má prázdný transkript`);
      }

      return {
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: transcript,
          },
          {
            role: "assistant",
            content: JSON.stringify(record.form_data, null, 2),
          },
        ],
      };
    });

    // 3. Filtruj záznamy s prázdným transkriptem
    const validExamples = trainingExamples.filter(
      (example: any) => example.messages[1].content.trim() !== ""
    );

    if (validExamples.length === 0) {
      return NextResponse.json(
        { error: "Žádné validní záznamy s transkriptem k exportu." },
        { status: 400 }
      );
    }

    // 4. Vytvoř JSONL obsah (každý řádek = jeden JSON objekt)
    const jsonlContent = validExamples
      .map((example: any) => JSON.stringify(example))
      .join("\n");

    // 5. Vrať jako soubor ke stažení
    return new NextResponse(jsonlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/jsonl",
        "Content-Disposition": `attachment; filename="fine-tuning-data-${new Date().toISOString().split('T')[0]}.jsonl"`,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/fine-tuning/export:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET endpoint pro statistiky exportu (volitelné)
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data: records, error } = await supabaseAdmin
      .from("paro_records")
      .select("id, quality_rating, llm_original, created_at, rated_at")
      .not("llm_original", "is", null)
      .eq("deleted", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rated = records?.filter((r: any) => r.quality_rating) || [];
    const readyForExport = rated.filter((r: any) => r.quality_rating >= 4);

    const stats = {
      total: records?.length || 0,
      rated: rated.length,
      readyForExport: readyForExport.length,
      avgRating:
        rated.length > 0
          ? rated.reduce((sum: number, r: any) => sum + r.quality_rating, 0) / rated.length
          : 0,
      byRating: {
        5: rated.filter((r: any) => r.quality_rating === 5).length,
        4: rated.filter((r: any) => r.quality_rating === 4).length,
        3: rated.filter((r: any) => r.quality_rating === 3).length,
        2: rated.filter((r: any) => r.quality_rating === 2).length,
        1: rated.filter((r: any) => r.quality_rating === 1).length,
      },
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("Error in GET /api/fine-tuning/export:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





