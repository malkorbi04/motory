import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { AppBar } from "@/components/PageHeader";
import DealerInventory from "@/components/DealerInventory";
import { createServerSupabase } from "@/lib/supabase";
import type { Car } from "@/lib/types";

export const metadata = { title: "My Listings — Motory" };

export default async function DealerPage() {
  const cookieStore = cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createServerSupabase();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "dealer") redirect("/inventory");

  const { data: cars } = await adminClient
    .from("cars")
    .select("*")
    .eq("submittedById", user.id)
    .order("createdAt", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />
      <DealerInventory cars={(cars ?? []) as Car[]} dealerName={profile.name} />
    </main>
  );
}
