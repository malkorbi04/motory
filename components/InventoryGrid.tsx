"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import type { Car, CarStatus } from "@/lib/types";

type Tab = "all" | "new" | "used";

export default function InventoryGrid() {
  const { t, isRTL } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCars = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/cars");
      if (!res.ok) throw new Error();
      setCars(await res.json());
    } catch { setError(t("error.load")); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const stats = {
    total: cars.length,
    pending: cars.filter((c) => c.status === "pending").length,
    available: cars.filter((c) => c.status === "available").length,
    sold: cars.filter((c) => c.status === "sold").length,
    newCars: cars.filter((c) => c.conditionType === "New").length,
    usedCars: cars.filter((c) => c.conditionType === "Used").length,
  };

  const byTab = cars.filter((c) =>
    activeTab === "new" ? c.conditionType === "New" :
    activeTab === "used" ? c.conditionType === "Used" : true
  );

  const filtered = byTab.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) ||
      String(c.year).includes(q) || (c.carTitle ?? "").toLowerCase().includes(q) ||
      (c.color ?? "").toLowerCase().includes(q);
  });

  async function handleStatusChange(id: string, status: CarStatus) {
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch { fetchCars(); }
  }

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "all",  label: t("tabs.all"),  count: stats.total },
    { id: "new",  label: t("tabs.new"),  count: stats.newCars },
    { id: "used", label: t("tabs.used"), count: stats.usedCars },
  ];

  return (
    <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: "stats.total",     val: stats.total,     color: "text-gray-800" },
          { key: "stats.pending",   val: stats.pending,   color: "text-yellow-600" },
          { key: "stats.available", val: stats.available, color: "text-green-600" },
          { key: "stats.sold",      val: stats.sold,      color: "text-red-600" },
        ] as const).map(({ key, val, color }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{t(key)}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
          {TABS.map(({ id, label, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
              }`}>
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                activeTab === id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        </div>
      </div>

      {/* Content */}
      {loading ? <LoadingSkeleton /> : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={fetchCars} className="mt-3 text-sm text-red-600 underline">{t("action.retry")}</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} hasSearch={!!searchQuery} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    { key: "table.photo",    w: "w-16" },
                    { key: "table.vehicle",  w: "" },
                    { key: "table.year",     w: "" },
                    { key: "table.km",       w: "" },
                    { key: "table.color",    w: "" },
                    { key: "table.price",    w: "" },
                    { key: "table.postedBy", w: "" },
                    { key: "table.status",   w: "" },
                    { key: "table.actions",  w: "" },
                  ].map(({ key, w }) => (
                    <th key={key} className={`text-start px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide ${w}`}>
                      {t(key as Parameters<typeof t>[0])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/cars/${car.id}`} className="block w-14 h-10 rounded-lg overflow-hidden bg-gray-100">
                        {car.mainPhotoUrl
                          ? <img src={car.mainPhotoUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                        }
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cars/${car.id}`} className="block">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{car.carTitle ?? `${car.make} ${car.model}`}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{car.conditionType ?? "—"} • {car.transmission ?? "—"} • {car.fuelType ?? "—"}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{car.year}</td>
                    <td className="px-4 py-3 text-gray-700" dir="ltr">
                      {car.conditionType === "New"
                        ? <span className="text-xs text-blue-600 font-medium">{t("table.valueNew")}</span>
                        : car.km ? car.km.toLocaleString() : "—"
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-700">{car.color || "—"}</td>
                    <td className="px-4 py-3" dir="ltr">
                      <span className="font-bold text-gray-900">{car.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ms-1">QAR</span>
                    </td>
                    <td className="px-4 py-3">
                      <PostedByBadge name={car.submittedByName} phone={car.submittedByPhone} />
                    </td>
                    <td className="px-4 py-3">
                      <select value={car.status} onChange={(e) => handleStatusChange(car.id, e.target.value as CarStatus)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="pending">{t("status.pending")}</option>
                        <option value="available">{t("status.available")}</option>
                        <option value="sold">{t("status.sold")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/cars/${car.id}/edit`} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors">{t("action.edit")}</Link>
                        <Link href={`/cars/${car.id}/post`} className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors">{t("action.post")}</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((car) => (
              <div key={car.id} className="flex gap-3 p-4">
                <Link href={`/cars/${car.id}`} className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 block">
                  {car.mainPhotoUrl
                    ? <img src={car.mainPhotoUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/cars/${car.id}`} className="block">
                    <p className="font-semibold text-gray-900 text-sm truncate">{car.carTitle ?? `${car.make} ${car.model}`}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{car.year} • {car.conditionType === "New" ? t("table.valueNew") : `${(car.km ?? 0).toLocaleString()} km`}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={car.status} />
                    <span className="text-sm font-bold text-gray-900" dir="ltr">{car.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">QAR</span></span>
                    <PostedByBadge name={car.submittedByName} phone={car.submittedByPhone} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/cars/${car.id}/edit`} className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">{t("action.edit")}</Link>
                    <Link href={`/cars/${car.id}/post`} className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-100 text-purple-700 font-medium hover:bg-purple-200">{t("action.post")}</Link>
                    <select value={car.status} onChange={(e) => handleStatusChange(car.id, e.target.value as CarStatus)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none">
                      <option value="pending">{t("status.pending")}</option>
                      <option value="available">{t("status.available")}</option>
                      <option value="sold">{t("status.sold")}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PostedByBadge({ name, phone }: { name?: string | null; phone?: string | null }) {
  if (name) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium max-w-[120px] truncate" title={name}>
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {name}
      </span>
    );
  }
  if (phone) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium" dir="ltr">
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {phone}
      </span>
    );
  }
  return <span className="text-gray-300 text-xs">—</span>;
}

function EmptyState({ tab, hasSearch }: { tab: Tab; hasSearch: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="text-center py-16 text-gray-400">
      <svg className="w-14 h-14 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16h2m-2 0H9m4 0h5m1 0v-5.535a2 2 0 00-.586-1.414l-3.463-3.465A2 2 0 0014.537 5H13" />
      </svg>
      <p className="font-semibold text-gray-500">
        {hasSearch ? t("empty.noMatch") : tab === "new" ? t("empty.noNew") : tab === "used" ? t("empty.noUsed") : t("empty.none")}
      </p>
      {!hasSearch && tab === "all" && <p className="text-sm mt-1">{t("empty.addFirst")}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4 animate-pulse">
            <div className="w-14 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
