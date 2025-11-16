import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
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
            // Noop - API routes jsou read-only
          },
        },
      }
    )

    // Získat aktuálního přihlášeného uživatele
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Authenticated user:", user.id);

    // Načíst POUZE záznamy tohoto uživatele
    const { data, error } = await supabase
      .from("paro_records")
      .select("*")
      .eq("user_id", user.id)  // 🔒 KRITICKÉ: Filtrovat podle user_id!
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in GET /api/records:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
            // Noop - API routes jsou read-only
          },
        },
      }
    )

    // Získat aktuálního přihlášeného uživatele
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, quality_rating, hygienist_feedback, rated_by } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    if (!quality_rating || quality_rating < 1 || quality_rating > 5) {
      return NextResponse.json(
        { error: "Quality rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update POUZE záznamu, který patří tomuto uživateli
    const { data, error } = await supabase
      .from("paro_records")
      .update({
        quality_rating,
        hygienist_feedback: hygienist_feedback || null,
        rated_at: new Date().toISOString(),
        rated_by: rated_by || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)  // 🔒 KRITICKÉ: Ověřit vlastnictví!
      .select()
      .single();

    if (error) {
      console.error("Error updating record rating:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in PATCH /api/records:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
