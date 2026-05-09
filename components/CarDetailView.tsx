"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import StatusBadge from "@/components/StatusBadge";
import type { Car, CarStatus } from "@/lib/types";

interface Props { car: Car; }

export default function CarDetailView({ car: initial }: Props) {
  const { t, isRTL } = useLanguage();
  const [car, setCar]           = useState<Car>(initial);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const allPhotos = [
    ...(car.mainPhotoUrl ? [car.mainPhotoUrl] : []),
    ...(car.morePhotoUrls ?? []),
  ];

  async function changeStatus(status: CarStatus) {
    setSaving(true);
    setCar((prev) => ({ ...prev, status }));
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCar((prev) => ({ ...prev, status: initial.status }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6" dir={isRTL ? "rtl" : "ltr"}>

      {/* Back + title row */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/inventory"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {car.carTitle ?? `${car.make} ${car.model}`}
          </h1>
        </div>
        <StatusBadge status={car.status} />
      </div>

      {/* Photo gallery */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {allPhotos.length > 0 ? (
          <>
            {/* Main large photo */}
            <div className="relative cursor-zoom-in" onClick={() => setLightbox(allPhotos[0])}>
              <img src={allPhotos[0]} alt="" className="w-full h-72 sm:h-96 object-cover" />
              {allPhotos.length > 1 && (
                <span className="absolute bottom-3 end-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  1 / {allPhotos.length}
                </span>
              )}
            </div>
            {/* Thumbnail strip */}
            {allPhotos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {allPhotos.map((url, i) => (
                  <button key={i} type="button" onClick={() => setLightbox(url)}
                    className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 border-transparent hover:border-blue-400 transition-colors">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-400">{t("detail.noPhotos")}</p>
          </div>
        )}
      </div>

      {/* Status change */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("detail.changeStatus")}</p>
        <div className="flex gap-3">
          {([
            { v: "pending"   as CarStatus, color: "border-yellow-400 bg-yellow-50  text-yellow-700" },
            { v: "available" as CarStatus, color: "border-green-500 bg-green-50   text-green-700"  },
            { v: "sold"      as CarStatus, color: "border-red-400   bg-red-50     text-red-600"    },
          ]).map(({ v, color }) => (
            <button key={v} type="button" disabled={saving} onClick={() => changeStatus(v)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                car.status === v ? color : "border-gray-200 text-gray-400 hover:border-gray-400"
              }`}>
              {t(`status.${v}` as "status.pending" | "status.available" | "status.sold")}
            </button>
          ))}
        </div>
      </div>

      {/* Car details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        {/* Price prominent */}
        <div className="flex items-baseline gap-2 mb-5 pb-4 border-b border-gray-100">
          <span className="text-3xl font-extrabold text-gray-900" dir="ltr">{car.price.toLocaleString()}</span>
          <span className="text-sm text-gray-400 font-medium">QAR</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          <Detail label={t("field.make")}         value={car.make} />
          <Detail label={t("field.model")}        value={car.model} />
          {car.trim     && <Detail label={t("field.trim")}  value={car.trim} />}
          <Detail label={t("field.year")}         value={String(car.year)} ltr />
          {car.conditionType && <Detail label={t("section.condition")} value={car.conditionType} />}
          {car.km !== undefined && car.conditionType !== "New" &&
            <Detail label={t("field.km")} value={car.km.toLocaleString()} ltr />}
          {car.transmission && <Detail label={t("field.transmission")} value={t(`opt.${car.transmission.toLowerCase()}` as Parameters<typeof t>[0])} />}
          {car.fuelType     && <Detail label={t("field.fuelType")}     value={t(`opt.${car.fuelType.toLowerCase()}` as Parameters<typeof t>[0])} />}
          {car.cylinders    && <Detail label={t("field.cylinders")}    value={String(car.cylinders)} ltr />}
          {car.color        && <Detail label={t("field.exteriorColor")} value={car.color} />}
          {car.interiorColor && <Detail label={t("field.interiorColor")} value={car.interiorColor} />}
          {car.seatType     && <Detail label={t("field.seatType")}     value={car.seatType} />}
          {car.paintCondition   && <Detail label={t("field.paintCondition")}   value={car.paintCondition} />}
          {car.engineCondition  && <Detail label={t("field.engineCondition")}  value={car.engineCondition} />}
          {car.gearCondition    && <Detail label={t("field.gearCondition")}    value={car.gearCondition} />}
          {car.chassisCondition && <Detail label={t("field.chassisCondition")} value={car.chassisCondition} />}
          {car.warranty && <Detail label={t("section.warranty")} value={car.warranty} />}
        </div>

        {/* Inspection report */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t("field.inspectionReport")}</p>
          {car.inspectionReportUrl ? (
            <a href={car.inspectionReportUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("detail.inspectionReport")}
            </a>
          ) : (
            <p className="text-sm text-gray-400">{t("detail.noReport")}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pb-8">
        <Link href={`/cars/${car.id}/edit`}
          className="flex-1 text-center py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
          {t("action.edit")}
        </Link>
        <Link href={`/cars/${car.id}/post`}
          className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {t("action.post")}
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors text-xl">
            ×
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()} />
          {/* Strip navigation at bottom */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {allPhotos.map((url, i) => (
                <button key={i} type="button" onClick={() => setLightbox(url)}
                  className={`w-10 h-8 rounded-lg overflow-hidden border-2 transition-colors ${
                    lightbox === url ? "border-white" : "border-transparent opacity-60"
                  }`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-800" dir={ltr ? "ltr" : undefined}>{value}</p>
    </div>
  );
}
