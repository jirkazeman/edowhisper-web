import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/records/[id]/verify
 * Marks a record as verified by hygienist (ready for fine-tuning)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify record exists and belongs to user
    const { data: record, error: fetchError } = await supabase
      .from('paro_records')
      .select('id, user_id, verified_by_hygienist')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Record not found or access denied' },
        { status: 404 }
      );
    }

    // Toggle verification status
    const newVerifiedStatus = !record.verified_by_hygienist;

    // Update record
    const { error: updateError } = await supabase
      .from('paro_records')
      .update({
        verified_by_hygienist: newVerifiedStatus,
        verified_at: newVerifiedStatus ? new Date().toISOString() : null,
        verified_by: newVerifiedStatus ? user.id : null,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: newVerifiedStatus,
      verified_at: newVerifiedStatus ? new Date().toISOString() : null,
      message: newVerifiedStatus 
        ? '✅ Záznam ověřen a připraven pro trénink LLM'
        : '⚠️ Ověření zrušeno'
    });

  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
