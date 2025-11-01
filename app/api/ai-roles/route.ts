import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("ai_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching AI roles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in GET /api/ai-roles:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
