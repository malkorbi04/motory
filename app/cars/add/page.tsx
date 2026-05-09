import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CarForm from "@/components/CarForm";
import { AppBar, EntryHeader } from "@/components/PageHeader";
import { createServerSupabase } from "@/lib/supabase";

export const metadata = { title: "Add Car — Motory" };

export default async function AddCarPage() {
  // Get current user from session cookies
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

  // Fetch role using service role client
  let userRole: "admin" | "dealer" | "public" = "public";
  let userName = "";
  if (user) {
    const adminClient = createServerSupabase();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") userRole = "admin";
    else if (profile?.role === "dealer") userRole = "dealer";
    if (profile?.name) userName = profile.name;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AppBar />
      <EntryHeader />
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <CarForm
          mode="add"
          userRole={userRole}
          userId={user?.id}
          userName={userName}
        />
      </div>
    </main>
  );
}
