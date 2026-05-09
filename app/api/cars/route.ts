import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

function buildCarTitle(make: string, model: string, year: number, trim?: string): string {
  const trimPart = trim ? ` ${trim}` : "";
  return `${make} ${model} ${year}${trimPart}`;
}

function applyNewCarDefaults(body: Record<string, unknown>): void {
  if (body.conditionType === "New") {
    body.km = 0;
    body.paintCondition = "Original";
    body.engineCondition = "Excellent";
    body.gearCondition = "Excellent";
    body.chassisCondition = "Original";
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("cars")
    .select("*")
    .order("createdAt", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();

  body.carTitle = buildCarTitle(body.make, body.model, body.year, body.trim);
  applyNewCarDefaults(body);

  const { data, error } = await supabase
    .from("cars")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
