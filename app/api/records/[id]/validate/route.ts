/**
 * API endpoint pro Dual-LLM validation
 * POST /api/records/[id]/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidationService } from '@/lib/services/llmValidationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Noop - API routes jsou read-only
          },
        },
      }
    );

    // Ověření autentizace
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recordId = params.id;
    const body = await request.json();
    const validatorModel = body.validatorModel || 'gemini-2.0-flash-exp';

    console.log(`🔍 Validating record ${recordId} with ${validatorModel}...`);

    // Načíst záznam
    const { data: record, error: fetchError } = await supabase
      .from('paro_records')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Record not found or access denied' },
        { status: 404 }
      );
    }

    // Zkontrolovat že má full transcript
    if (!record.full_transcript) {
      return NextResponse.json(
        { error: 'Record does not have a transcript for validation' },
        { status: 400 }
      );
    }

    // Připravit data pro validaci
    const primaryExtraction = {
      pii: {
        lastName: record.last_name,
        personalIdNumber: record.personal_id_number,
      },
      anamnesis: {
        isSmoker: record.is_smoker,
        generalAnamnesis: record.general_anamnesis,
        allergies: record.allergies,
        stomatologicalAnamnesis: record.stomatological_anamnesis,
        permanentMedication: record.permanent_medication,
      },
      exam: {
        hygiene: record.hygiene,
        gingiva: record.gingiva,
        tartar: record.tartar,
        tools: record.tools,
        caries: record.caries,
        mucosa: record.mucosa,
        tongue: record.tongue,
        frenulum: record.frenulum,
        occlusion: record.occlusion,
        orthodonticAnomaly: record.orthodontic_anomaly,
      },
      pbi: {
        date: record.pbi_date,
        result: record.pbi_result,
        tools: record.pbi_tools,
      },
      dentalCross: record.dental_cross || {},
      cpitn: {
        upperRight: record.cpitn_upper_right,
        upperLeft: record.cpitn_upper_left,
        lowerLeft: record.cpitn_lower_left,
        lowerRight: record.cpitn_lower_right,
      },
      treatmentRecord: record.treatment_record,
      examinationSummary: record.examination_summary,
      meta: {
        llm_engine: record.llm_engine || 'unknown',
      },
    };

    // Zavolat validation service
    const validationService = getValidationService(process.env.GEMINI_API_KEY);
    const validationResult = await validationService.validateExtraction(
      record.full_transcript,
      primaryExtraction,
      validatorModel
    );

    // Uložit výsledek validace do DB
    const { error: insertError } = await supabase
      .from('extraction_validations')
      .insert({
        record_id: recordId,
        user_id: user.id,
        validator_llm: validatorModel,
        is_valid: validationResult.is_valid,
        confidence: validationResult.confidence,
        agreement_percentage: validationResult.agreement_percentage,
        hallucinations: validationResult.hallucinations,
        missing_data: validationResult.missing_data,
        negation_errors: validationResult.negation_errors,
        correct_fields: validationResult.correct_fields,
        overall_assessment: validationResult.overall_assessment,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to save validation result:', insertError);
      // Pokračujeme i když se neuložilo
    }

    // Update record status
    await supabase
      .from('paro_records')
      .update({
        validation_status: validationResult.is_valid ? 'validated' : 'issues_found',
        validation_confidence: validationResult.confidence,
        validation_timestamp: new Date().toISOString(),
      })
      .eq('id', recordId);

    return NextResponse.json({
      success: true,
      validation: validationResult,
    });
  } catch (error: any) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
}

