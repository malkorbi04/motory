"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { CarStatus } from "@/lib/types";

const colors: Record<CarStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border border-yellow-200",
  available: "bg-green-100  text-green-800  border border-green-200",
  sold:      "bg-red-100    text-red-800    border border-red-200",
};

const keys: Record<CarStatus, "status.pending" | "status.available" | "status.sold"> = {
  pending:   "status.pending",
  available: "status.available",
  sold:      "status.sold",
};

export default function StatusBadge({ status }: { status: CarStatus }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status]}`}>
      {t(keys[status])}
    </span>
  );
}
