import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/records/[id]/verify
 * Marks a record as verified by hygienist (ready for fine-tuning)
 * 
 * 🔧 SIMPLIFIED: Uses service role key directly (bypasses auth complexity)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user_id from request body (sent from frontend)
    const body = await request.json();
    const userId = body.user_id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id in request body' },
        { status: 400 }
      );
    }
    
    console.log('📝 Verifying record:', { id, userId });
    
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify record exists and belongs to user
    const { data: record, error: fetchError } = await supabase
      .from('paro_records')
      .select('id, user_id, verified_by_hygienist')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !record) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Record not found or access denied', details: fetchError?.message },
        { status: 404 }
      );
    }

    console.log('✅ Record found:', record.id);

    // Toggle verification status
    const newVerifiedStatus = !record.verified_by_hygienist;

    console.log('🔄 Updating verification:', newVerifiedStatus);

    // Update record (service role bypasses RLS)
    const { error: updateError } = await supabase
      .from('paro_records')
      .update({
        verified_by_hygienist: newVerifiedStatus,
        verified_at: newVerifiedStatus ? new Date().toISOString() : null,
        verified_by: newVerifiedStatus ? userId : null,
      })
      .eq('id', id)
      .eq('user_id', userId);

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
