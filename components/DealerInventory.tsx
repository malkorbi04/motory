"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/StatusBadge";
import type { Car, CarStatus } from "@/lib/types";

interface Props {
  cars: Car[];
  dealerName: string;
}

const STATUSES: { value: CarStatus | "all"; labelKey: string }[] = [
  { value: "all",       labelKey: "tabs.all"         },
  { value: "available", labelKey: "status.available" },
  { value: "sold",      labelKey: "status.sold"      },
];

export default function DealerInventory({ cars, dealerName }: Props) {
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<CarStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = cars.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.make?.toLowerCase().includes(q) ||
      c.model?.toLowerCase().includes(q) ||
      String(c.year).includes(q) ||
      c.carTitle?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const total     = cars.length;
  const available = cars.filter((c) => c.status === "available").length;
  const sold      = cars.filter((c) => c.status === "sold").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page title */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          {dealerName}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{t("nav.myListings")}</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label={t("stats.total")}     value={total}     color="blue"  />
        <StatCard label={t("stats.available")} value={available} color="green" />
        <StatCard label={t("stats.sold")}      value={sold}      color="red"   />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full border border-gray-200 rounded-xl ps-9 pe-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Add button */}
        <Link
          href="/cars/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("action.addCar")}
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
        {STATUSES.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t(labelKey as any)}
          </button>
        ))}
      </div>

      {/* Cars list */}
      {filtered.length === 0 ? (
        <EmptyState search={search} filter={filter} t={t} />
      ) : (
        <div className="space-y-3">
          {filtered.map((car) => (
            <DealerCarRow key={car.id} car={car} t={t} isRTL={isRTL} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealerCarRow({ car, t, isRTL }: { car: Car; t: any; isRTL: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        {car.mainPhotoUrl ? (
          <img src={car.mainPhotoUrl} alt={car.carTitle ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {car.carTitle ?? `${car.make} ${car.model} ${car.year}`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5" dir="ltr">
          {car.price ? car.price.toLocaleString() + " SAR" : "—"}
          {car.km !== undefined && car.km > 0 ? ` · ${car.km.toLocaleString()} km` : ""}
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={car.status as CarStatus} />
      </div>

      {/* Edit button */}
      <Link
        href={`/cars/${car.id}/edit`}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
        title={t("action.edit")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "blue" | "yellow" | "green" | "red" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green:  "bg-green-50 text-green-700",
    red:    "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-2xl p-3 text-center ${colors[color]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function EmptyState({ search, filter, t }: { search: string; filter: string; t: any }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16h2m-2 0H9m4 0h5m1 0v-5.535a2 2 0 00-.586-1.414l-3.463-3.465A2 2 0 0014.537 5H13" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">
        {search || filter !== "all" ? t("empty.noResults") : t("empty.noCars")}
      </p>
      {!search && filter === "all" && (
        <Link
          href="/cars/add"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("action.addCar")}
        </Link>
      )}
    </div>
  );
}
