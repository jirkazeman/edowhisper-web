import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateField, validateFields } from "@/lib/services/geminiValidationService";

/**
 * POST /api/records/[id]/validate-field
 * 
 * Validuje jedno nebo více low-confidence polí pomocí Gemini
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Noop
          },
        },
      }
    )

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { fieldName, fieldValue, fields } = body;

    // Načti záznam
    const { data: record, error: fetchError } = await supabase
      .from("paro_records")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Získej původní transkript
    const originalTranscript = 
      record.llm_original?.transcript ||
      record.llm_original?.user_prompt ||
      record.form_data?.fullTranscript ||
      "";

    if (!originalTranscript) {
      return NextResponse.json(
        { error: "No transcript available for validation" },
        { status: 400 }
      );
    }

    // Batch validation (více polí najednou)
    if (fields && Array.isArray(fields)) {
      const corrections = await validateFields(
        fields,
        originalTranscript,
        record.form_data
      );

      // Ulož Gemini corrections do databáze
      const updatedCorrections = {
        ...(record.gemini_corrections || {}),
        ...corrections
      };

      await supabase
        .from("paro_records")
        .update({
          gemini_corrections: updatedCorrections,
          validation_method: 'dual-llm'
        })
        .eq("id", id)
        .eq("user_id", user.id);

      return NextResponse.json({
        success: true,
        corrections
      });
    }

    // Single field validation
    if (fieldName && fieldValue !== undefined) {
      const correction = await validateField(
        fieldName,
        fieldValue,
        originalTranscript,
        record.form_data
      );

      // Ulož Gemini correction do databáze
      const updatedCorrections = {
        ...(record.gemini_corrections || {}),
        [fieldName]: correction
      };

      await supabase
        .from("paro_records")
        .update({
          gemini_corrections: updatedCorrections,
          validation_method: 'dual-llm'
        })
        .eq("id", id)
        .eq("user_id", user.id);

      return NextResponse.json({
        success: true,
        fieldName,
        correction
      });
    }

    return NextResponse.json(
      { error: "Missing fieldName and fieldValue or fields array" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Error in POST /api/records/[id]/validate-field:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/records/[id]/validate-field
 * 
 * Načte Gemini corrections pro záznam
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Noop
          },
        },
      }
    )

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Načti gemini_corrections
    const { data: record, error } = await supabase
      .from("paro_records")
      .select("gemini_corrections, low_confidence_fields, confidence_scores")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gemini_corrections: record.gemini_corrections || {},
      low_confidence_fields: record.low_confidence_fields || [],
      confidence_scores: record.confidence_scores || {}
    });

  } catch (error: any) {
    console.error("Error in GET /api/records/[id]/validate-field:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

