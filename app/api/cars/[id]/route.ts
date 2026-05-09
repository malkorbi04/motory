import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

type RouteContext = { params: { id: string } };

function buildCarTitle(make: string, model: string, year: number, trim?: string): string {
  const trimPart = trim ? ` ${trim}` : "";
  return `${make} ${model} ${year}${trimPart}`;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const supabase = createServerSupabase();
  const body = await request.json();

  // Regenerate carTitle if any title-relevant field is changing
  if (body.make !== undefined || body.model !== undefined || body.year !== undefined || body.trim !== undefined) {
    const { data: existing } = await supabase
      .from("cars")
      .select("make, model, year, trim")
      .eq("id", params.id)
      .single();

    if (existing) {
      const make = body.make ?? existing.make;
      const model = body.model ?? existing.model;
      const year = body.year ?? existing.year;
      const trim = body.trim !== undefined ? body.trim : existing.trim;
      body.carTitle = buildCarTitle(make, model, year, trim);
    }
  }

  if (body.conditionType === "New") {
    body.km = 0;
    body.paintCondition = "Original";
    body.engineCondition = "Excellent";
    body.gearCondition = "Excellent";
    body.chassisCondition = "Original";
  }

  const { data, error } = await supabase
    .from("cars")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
