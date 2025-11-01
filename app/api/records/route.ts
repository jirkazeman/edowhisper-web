import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("paro_records")
      .select("*")
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
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
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

    const { data, error } = await supabaseAdmin
      .from("paro_records")
      .update({
        quality_rating,
        hygienist_feedback: hygienist_feedback || null,
        rated_at: new Date().toISOString(),
        rated_by: rated_by || null,
      })
      .eq("id", id)
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
