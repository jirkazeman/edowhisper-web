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
    
    // Get auth token from cookie or header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Extract access token
    let accessToken = null;
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    } else if (cookieHeader) {
      const match = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const tokenData = JSON.parse(decodeURIComponent(match[1]));
          accessToken = tokenData.access_token;
        } catch (e) {
          console.error('Error parsing cookie token:', e);
        }
      }
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }
    
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Create Supabase client with user token for auth
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Verify record exists and belongs to user
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('paro_records')
      .select('id, user_id, verified_by_hygienist')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !record) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Record not found or access denied', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Toggle verification status
    const newVerifiedStatus = !record.verified_by_hygienist;

    // Update record using admin client (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
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
