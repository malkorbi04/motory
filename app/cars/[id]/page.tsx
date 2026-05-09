import { notFound } from "next/navigation";
import { AppBar } from "@/components/PageHeader";
import CarDetailView from "@/components/CarDetailView";
import { createServerSupabase } from "@/lib/supabase";
import type { Car } from "@/lib/types";

export const metadata = { title: "Car Details — Motory" };

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !car) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />
      <CarDetailView car={car as Car} />
    </main>
  );
}
