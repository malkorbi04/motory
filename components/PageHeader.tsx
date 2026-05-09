"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useLanguage } from "@/context/LanguageContext";

/* ─────────────────────────────────────────
   Shared branded app bar (top of every page)
   ───────────────────────────────────────── */
export function AppBar() {
  const { isRTL } = useLanguage();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: profile } = await client
        .from("profiles")
        .select("name")
        .eq("id", data.session.user.id)
        .single();
      if (profile?.name) setUserName(profile.name);
    });
  }, []);

  async function handleLogout() {
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await client.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-md sticky top-0 z-30"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16h2m-2 0H9m4 0h5m1 0v-5.535a2 2 0 00-.586-1.414l-3.463-3.465A2 2 0 0014.537 5H13" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="text-lg font-extrabold tracking-tight text-white">Motory</span>
            <span className="text-blue-400 font-bold text-base ms-1.5">موتوري</span>
          </div>
        </div>

        {/* Right side: lang toggle + user */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
            <LangBtn code="en" label="EN" />
            <LangBtn code="ar" label="AR" />
          </div>

          {/* User + logout */}
          {userName && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white/90 hidden sm:block">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LangBtn({ code, label }: { code: "en" | "ar"; label: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(code)}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        lang === code ? "bg-white text-gray-900 shadow-sm" : "text-white/60 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────
   Admin page header (below AppBar)
   ───────────────────────────────────────── */
export function AdminHeader() {
  const { t, isRTL } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Motory — موتوري
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{t("nav.admin")}</h1>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Data-entry / Edit sticky bar (below AppBar)
   ───────────────────────────────────────── */
interface EntryHeaderProps {
  carTitle?: string;
}

export function EntryHeader({ carTitle }: EntryHeaderProps) {
  const { isRTL } = useLanguage();
  const label = carTitle ?? "Motory";
  return (
    <div className="bg-white border-b border-gray-100 sticky top-14 z-10">
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 h-11 flex items-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
      </div>
    </div>
  );
}
