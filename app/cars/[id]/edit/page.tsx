import { notFound } from "next/navigation";
import CarForm from "@/components/CarForm";
import { AppBar, EntryHeader } from "@/components/PageHeader";
import { createServerSupabase } from "@/lib/supabase";
import type { Car } from "@/lib/types";

export const metadata = { title: "Edit Listing — Motory" };

export default async function EditCarPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !car) notFound();

  const carData = car as Car;
  const title = carData.carTitle ?? `${carData.make} ${carData.model}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />
      <EntryHeader carTitle={title} />
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <CarForm mode="edit" carId={params.id} initialData={carData} />
      </div>
    </main>
  );
}
