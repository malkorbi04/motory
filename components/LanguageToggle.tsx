"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          lang === "en"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          lang === "ar"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        AR
      </button>
    </div>
  );
}
