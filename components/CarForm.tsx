"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MakeModelTrimSelector from "@/components/MakeModelTrimSelector";
import ComboboxField from "@/components/ComboboxField";
import { useLanguage } from "@/context/LanguageContext";
import type { Car, CarFormData, CarStatus, ConditionType } from "@/lib/types";

interface CarFormProps {
  mode: "add" | "edit";
  carId?: string;
  initialData?: Partial<Car>;
  userRole?: "admin" | "dealer" | "public";
  userId?: string;
  userName?: string;
}

const currentYear = new Date().getFullYear();

const EXTERIOR_COLORS = [
  "White","Pearl White","Off White","Glacier White",
  "Black","Midnight Black",
  "Silver","Metallic Silver",
  "Gray","Dark Gray","Charcoal",
  "Red","Dark Red","Maroon","Burgundy",
  "Blue","Navy Blue","Dark Blue","Sky Blue","Royal Blue",
  "Green","Dark Green","Olive Green","Forest Green",
  "Brown","Bronze","Copper",
  "Beige","Cream","Champagne","Gold","Sand",
  "Orange","Yellow","Purple",
];

const INTERIOR_COLORS = [
  "Black","Beige","Cream","Brown","Gray","White","Red","Blue","Tan",
  "Two-Tone Black/Beige","Two-Tone Black/Brown","Two-Tone Black/Red",
];

const NEW_DEFAULTS = {
  km: 0,
  paintCondition: "Original",
  engineCondition: "Excellent",
  gearCondition: "Excellent",
  chassisCondition: "Original",
};

const EMPTY_FORM: CarFormData = {
  make: "", model: "", trim: "",
  year: currentYear, price: 0, km: 0,
  color: "", cylinders: undefined,
  transmission: "", fuelType: "",
  conditionType: "Used",
  paintCondition: "", warranty: "",
  engineCondition: "", gearCondition: "", chassisCondition: "",
  interiorColor: "", seatType: "",
  mainPhotoUrl: "", morePhotoUrls: [],
  inspectionReportUrl: "",
  submittedByPhone: "",
  status: "pending",
};

export default function CarForm({ mode, carId, initialData, userRole = "public", userId, userName }: CarFormProps) {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const isDealer = userRole === "dealer";
  const cancelDest = isDealer ? "/dealer" : "/inventory";
  const mainPhotoRef    = useRef<HTMLInputElement>(null);
  const mainCameraRef   = useRef<HTMLInputElement>(null);
  const morePhotosRef   = useRef<HTMLInputElement>(null);
  const moreCameraRef   = useRef<HTMLInputElement>(null);
  const inspectionReportRef    = useRef<HTMLInputElement>(null);
  const inspectionCameraRef    = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CarFormData>({ ...EMPTY_FORM, ...initialData });
  const [mainPhotoPreview, setMainPhotoPreview] = useState(initialData?.mainPhotoUrl ?? "");
  const [morePhotosPreviews, setMorePhotosPreviews] = useState<string[]>(initialData?.morePhotoUrls ?? []);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingMore, setUploadingMore] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportFileName, setReportFileName] = useState(
    initialData?.inspectionReportUrl
      ? decodeURIComponent(initialData.inspectionReportUrl.split("/").pop() ?? "report")
      : ""
  );
  const [imageWarning, setImageWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CarFormData, string>>>({});

  // Photo menus
  const [mainPhotoMenu, setMainPhotoMenu]         = useState(false);
  const [morePhotoMenu, setMorePhotoMenu]         = useState(false);
  const [inspectionReportMenu, setInspectionReportMenu] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "google_pay" | "card" | "">("");
  const [cardName, setCardName]     = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv]       = useState("");

  const isNew = formData.conditionType === "New";

  function set(field: keyof CarFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleConditionChange(value: ConditionType) {
    if (value === "New") {
      setFormData((prev) => ({ ...prev, conditionType: "New", ...NEW_DEFAULTS }));
    } else {
      setFormData((prev) => ({ ...prev, conditionType: "Used" }));
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    return (await res.json()).url ?? null;
  }

  async function handleMainPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainPhotoPreview(URL.createObjectURL(file));
    setUploadingMain(true);
    setImageWarning("");
    const url = await uploadFile(file);
    setUploadingMain(false);
    if (url) { set("mainPhotoUrl", url); setMainPhotoPreview(url); }
    else setImageWarning(t("error.photoFail"));
  }

  async function handleMorePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingMore(true);
    const local = files.map((f) => URL.createObjectURL(f));
    setMorePhotosPreviews((p) => [...p, ...local]);
    const urls: string[] = [];
    let hadError = false;
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) urls.push(url); else hadError = true;
    }
    setUploadingMore(false);
    if (urls.length) {
      set("morePhotoUrls", [...(formData.morePhotoUrls ?? []), ...urls]);
      setMorePhotosPreviews((p) => [...p.slice(0, p.length - local.length), ...urls]);
    }
    if (hadError) setImageWarning(t("error.photosFail"));
  }

  function removeMorePhoto(index: number) {
    setMorePhotosPreviews((p) => p.filter((_, i) => i !== index));
    set("morePhotoUrls", (formData.morePhotoUrls ?? []).filter((_, i) => i !== index));
  }

  async function handleInspectionReportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReport(true);
    setReportFileName(file.name);
    const url = await uploadFile(file);
    setUploadingReport(false);
    if (url) {
      set("inspectionReportUrl", url);
    } else {
      setReportFileName("");
      setImageWarning(t("error.photoFail"));
    }
  }

  function removeInspectionReport() {
    set("inspectionReportUrl", "");
    setReportFileName("");
    if (inspectionReportRef.current) inspectionReportRef.current.value = "";
    if (inspectionCameraRef.current)  inspectionCameraRef.current.value  = "";
  }

  function validate(): boolean {
    const e: Partial<Record<keyof CarFormData, string>> = {};
    if (userRole === "public" && !formData.submittedByPhone?.trim()) e.submittedByPhone = t("error.phone");
    if (!formData.make) e.make = t("error.make");
    if (!formData.model) e.model = t("error.model");
    if (!formData.year || formData.year < 1970 || formData.year > currentYear + 1) e.year = t("error.year");
    if (!formData.price || formData.price <= 0) e.price = t("error.price");
    if (!formData.status) e.status = t("error.status");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const url = mode === "add" ? "/api/cars" : `/api/cars/${carId}`;
      const payload = {
        ...formData,
        ...(mode === "add" && userId ? { submittedById: userId, submittedByName: userName ?? "" } : {}),
      };
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Error"); }
      await res.json();
      if (mode === "add") {
        if (userRole === "public") router.push("/submit/done");
        else if (isDealer) router.push("/dealer");
        else router.push("/inventory");
      } else {
        router.push(isDealer ? "/dealer" : "/inventory");
      }
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>

      {/* Contact — public customers only */}
      {userRole === "public" && (
        <Section title={t("section.contact")}>
          <Field label={t("field.phone")} required error={errors.submittedByPhone}>
            <div className="relative">
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.submittedByPhone ?? ""}
                onChange={(e) => set("submittedByPhone", e.target.value)}
                placeholder={t("input.phone")}
                dir="ltr"
                className={`${iCls(!!errors.submittedByPhone)} ps-9`}
              />
            </div>
          </Field>
          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.99 2C6.475 2 2 6.475 2 11.99c0 1.917.518 3.713 1.426 5.258L2 22l4.878-1.396A9.96 9.96 0 0011.99 22C17.506 22 22 17.525 22 12.01 22 6.495 17.505 2 11.99 2z"/>
            </svg>
            We will contact you on WhatsApp
          </p>
        </Section>
      )}

      {/* Condition */}
      <Section title={t("section.condition")}>
        <div className="flex gap-3">
          {(["Used", "New"] as ConditionType[]).map((c) => (
            <button key={c} type="button" onClick={() => handleConditionChange(c)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                formData.conditionType === c
                  ? c === "New" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-700 bg-gray-100 text-gray-800"
                  : "border-gray-200 text-gray-400 hover:border-gray-400"
              }`}>
              {c === "New" ? t("cond.new") : t("cond.used")}
            </button>
          ))}
        </div>
        {isNew && (
          <p className="mt-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">{t("cond.newNotice")}</p>
        )}
        <div className={`mt-4 grid gap-4 ${!isNew ? "grid-cols-2" : "grid-cols-1"}`}>
          <Field label={t("field.price")} required error={errors.price}>
            <div className="relative">
              <input type="text" inputMode="numeric" dir="ltr"
                value={formData.price ? formData.price.toLocaleString() : ""}
                onChange={(e) => { const r = e.target.value.replace(/,/g, "").replace(/[^0-9.]/g, ""); set("price", r === "" ? 0 : parseFloat(r)); }}
                placeholder="0"
                className={`${iCls(!!errors.price)} pl-14`} />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">QAR</span>
            </div>
          </Field>
          {!isNew && (
            <Field label={t("field.km")}>
              <input type="text" inputMode="numeric" dir="ltr"
                value={formData.km ? formData.km.toLocaleString() : ""}
                onChange={(e) => { const r = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, ""); set("km", r === "" ? 0 : parseInt(r)); }}
                placeholder="0" className={iCls()} />
            </Field>
          )}
        </div>
      </Section>

      {/* Vehicle Info */}
      <Section title={t("section.vehicleInfo")}>
        <MakeModelTrimSelector
          make={formData.make} model={formData.model} trim={formData.trim ?? ""}
          errors={{ make: errors.make, model: errors.model }}
          onChange={(field, value) => {
            if (field === "make") { setFormData((p) => ({ ...p, make: value, model: "", trim: "" })); setErrors((p) => ({ ...p, make: undefined })); }
            else if (field === "model") { setFormData((p) => ({ ...p, model: value, trim: "" })); setErrors((p) => ({ ...p, model: undefined })); }
            else set("trim", value);
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <Field label={t("field.year")} required error={errors.year}>
            <input type="number" value={formData.year}
              onChange={(e) => set("year", parseInt(e.target.value) || currentYear)}
              min={1970} max={currentYear + 1} className={iCls(!!errors.year)} dir="ltr" />
          </Field>
          <Field label={t("field.transmission")}>
            <select value={formData.transmission ?? ""} onChange={(e) => set("transmission", e.target.value)} className={iCls()}>
              <option value="">{t("select.placeholder")}</option>
              <option value="Automatic">{t("opt.automatic")}</option>
              <option value="Manual">{t("opt.manual")}</option>
            </select>
          </Field>
          <Field label={t("field.fuelType")}>
            <select value={formData.fuelType ?? ""} onChange={(e) => set("fuelType", e.target.value)} className={iCls()}>
              <option value="">{t("select.placeholder")}</option>
              <option value="Petrol">{t("opt.petrol")}</option>
              <option value="Diesel">{t("opt.diesel")}</option>
              <option value="Hybrid">{t("opt.hybrid")}</option>
              <option value="Electric">{t("opt.electric")}</option>
            </select>
          </Field>
          <Field label={t("field.cylinders")}>
            <select value={formData.cylinders ?? ""} onChange={(e) => set("cylinders", e.target.value ? parseInt(e.target.value) : undefined)} className={iCls()}>
              <option value="">{t("select.placeholder")}</option>
              {[4, 6, 8, 12, 16].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label={t("field.exteriorColor")}>
            <ComboboxField value={formData.color ?? ""} onChange={(v) => set("color", v)}
              options={EXTERIOR_COLORS} placeholder={t("input.typeColor")} />
          </Field>
          <Field label={t("field.interiorColor")}>
            <ComboboxField value={formData.interiorColor ?? ""} onChange={(v) => set("interiorColor", v)}
              options={INTERIOR_COLORS} placeholder={t("input.typeColor")} />
          </Field>
          <Field label={t("field.seatType")}>
            <select value={formData.seatType ?? ""} onChange={(e) => set("seatType", e.target.value)} className={iCls()}>
              <option value="">{t("select.placeholder")}</option>
              <option value="Leather">{t("opt.leather")}</option>
              <option value="Cloth">{t("opt.cloth")}</option>
              <option value="Suede">{t("opt.suede")}</option>
              <option value="Alcantara">{t("opt.alcantara")}</option>
              <option value="Half Leather">{t("opt.halfLeather")}</option>
              <option value="Velvet">{t("opt.velvet")}</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Condition Details — hidden when New */}
      {!isNew && (
        <Section title={t("section.conditionDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("field.paintCondition")}>
              <select value={formData.paintCondition ?? ""} onChange={(e) => set("paintCondition", e.target.value)} className={iCls()}>
                <option value="">{t("select.placeholder")}</option>
                <option value="Original">{t("opt.original")}</option>
                <option value="Excellent">{t("opt.excellent")}</option>
                <option value="Good">{t("opt.good")}</option>
                <option value="Fair">{t("opt.fair")}</option>
                <option value="Repainted">{t("opt.repainted")}</option>
                <option value="Poor">{t("opt.poor")}</option>
              </select>
            </Field>
            <Field label={t("field.engineCondition")}>
              <select value={formData.engineCondition ?? ""} onChange={(e) => set("engineCondition", e.target.value)} className={iCls()}>
                <option value="">{t("select.placeholder")}</option>
                <option value="Excellent">{t("opt.excellent")}</option>
                <option value="Good">{t("opt.good")}</option>
                <option value="Fair">{t("opt.fair")}</option>
                <option value="Needs Service">{t("opt.needsService")}</option>
              </select>
            </Field>
            <Field label={t("field.gearCondition")}>
              <select value={formData.gearCondition ?? ""} onChange={(e) => set("gearCondition", e.target.value)} className={iCls()}>
                <option value="">{t("select.placeholder")}</option>
                <option value="Excellent">{t("opt.excellent")}</option>
                <option value="Good">{t("opt.good")}</option>
                <option value="Fair">{t("opt.fair")}</option>
                <option value="Needs Service">{t("opt.needsService")}</option>
              </select>
            </Field>
            <Field label={t("field.chassisCondition")}>
              <select value={formData.chassisCondition ?? ""} onChange={(e) => set("chassisCondition", e.target.value)} className={iCls()}>
                <option value="">{t("select.placeholder")}</option>
                <option value="Original">{t("opt.original")}</option>
                <option value="Minor Repair">{t("opt.minorRepair")}</option>
                <option value="Major Repair">{t("opt.majorRepair")}</option>
              </select>
            </Field>
          </div>
        </Section>
      )}

      {/* Warranty */}
      <Section title={t("section.warranty")}>
        <div className="flex gap-3">
          {(["Yes", "No"] as const).map((v) => (
            <button key={v} type="button" onClick={() => set("warranty", v)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                formData.warranty === v
                  ? v === "Yes"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-400 bg-red-50 text-red-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-400"
              }`}>
              {v === "Yes" ? t("warranty.yes") : t("warranty.no")}
            </button>
          ))}
        </div>
      </Section>

      {/* Status — admin edit only */}
      {mode === "edit" && <Section title={t("section.listingStatus")}>
        <div className="flex gap-3 flex-wrap">
          {([
            { v: "available", color: "border-green-500 bg-green-50 text-green-700" },
            { v: "sold",      color: "border-red-500 bg-red-50 text-red-700" },
          ] as const).map(({ v, color }) => (
            <button key={v} type="button" onClick={() => set("status", v)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                formData.status === v ? color : "border-gray-200 text-gray-400 hover:border-gray-400"
              }`}>
              {t(`status.${v}` as "status.available" | "status.sold")}
            </button>
          ))}
        </div>
        {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
      </Section>}

      {/* Photos */}
      <Section title={t("section.photos")}>
        {imageWarning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm mb-4">⚠️ {imageWarning}</div>
        )}
        {/* Main Photo */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("field.mainPhoto")}</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => !mainPhotoPreview && setMainPhotoMenu(true)}>
            {mainPhotoPreview
              ? <div className="relative">
                  <img src={mainPhotoPreview} alt="Main" className="w-full h-52 object-cover" />
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); setMainPhotoPreview(""); set("mainPhotoUrl", ""); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">×</button>
                </div>
              : <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{t("input.tapPhoto")}</span>
                </div>
            }
            {uploadingMain && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span className="text-sm text-blue-600 font-medium">Uploading…</span></div>}
          </div>

          {/* Action sheet */}
          {mainPhotoMenu && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setMainPhotoMenu(false)}>
              <div className="bg-white w-full max-w-3xl rounded-t-2xl p-4 space-y-2 pb-8"
                onClick={(e) => e.stopPropagation()}>
                <button type="button"
                  onClick={() => { setMainPhotoMenu(false); mainPhotoRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("photo.upload")}
                </button>
                <button type="button"
                  onClick={() => { setMainPhotoMenu(false); mainCameraRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("photo.camera")}
                </button>
              </div>
            </div>
          )}
          <input ref={mainPhotoRef}  type="file" accept="image/*" onChange={handleMainPhotoChange} className="hidden" />
          <input ref={mainCameraRef} type="file" accept="image/*" capture="environment" onChange={handleMainPhotoChange} className="hidden" />
        </div>

        {/* Additional Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("field.morePhotos")}</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {morePhotosPreviews.map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeMorePhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
              </div>
            ))}
            {/* Add more button */}
            <button type="button" onClick={() => setMorePhotoMenu(true)}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 transition-colors">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">{t("action.add")}</span>
            </button>
          </div>
          {uploadingMore && <p className="mt-2 text-sm text-blue-600">Uploading…</p>}

          {/* Action sheet */}
          {morePhotoMenu && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setMorePhotoMenu(false)}>
              <div className="bg-white w-full max-w-3xl rounded-t-2xl p-4 space-y-2 pb-8"
                onClick={(e) => e.stopPropagation()}>
                <button type="button"
                  onClick={() => { setMorePhotoMenu(false); morePhotosRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("photo.upload")}
                </button>
                <button type="button"
                  onClick={() => { setMorePhotoMenu(false); moreCameraRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("photo.camera")}
                </button>
              </div>
            </div>
          )}
          <input ref={morePhotosRef} type="file" accept="image/*" multiple onChange={handleMorePhotosChange} className="hidden" />
          <input ref={moreCameraRef} type="file" accept="image/*" capture="environment" onChange={handleMorePhotosChange} className="hidden" />
        </div>

        {/* Inspection Report */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("field.inspectionReport")}</label>

          {formData.inspectionReportUrl && reportFileName ? (
            /* Attached state */
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                {reportFileName.toLowerCase().endsWith(".pdf") ? (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <p className="flex-1 text-sm text-gray-700 truncate">{reportFileName}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a href={formData.inspectionReportUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-medium hover:underline">{t("action.viewReport")}</a>
                <button type="button" onClick={removeInspectionReport}
                  className="text-xs text-red-500 font-medium hover:underline">{t("action.removeReport")}</button>
              </div>
            </div>
          ) : (
            /* Empty / uploading state — tap to open action sheet */
            <div onClick={() => !uploadingReport && setInspectionReportMenu(true)}
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                {uploadingReport ? (
                  <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {uploadingReport ? "Uploading…" : t("input.tapReport")}
              </span>
            </div>
          )}

          {/* Action sheet */}
          {inspectionReportMenu && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setInspectionReportMenu(false)}>
              <div className="bg-white w-full max-w-3xl rounded-t-2xl p-4 space-y-2 pb-8"
                onClick={(e) => e.stopPropagation()}>
                <button type="button"
                  onClick={() => { setInspectionReportMenu(false); inspectionReportRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("photo.upload")}
                </button>
                <button type="button"
                  onClick={() => { setInspectionReportMenu(false); inspectionCameraRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("photo.camera")}
                </button>
              </div>
            </div>
          )}

          <input ref={inspectionReportRef} type="file" accept="image/*,application/pdf"
            onChange={handleInspectionReportChange} className="hidden" />
          <input ref={inspectionCameraRef} type="file" accept="image/*" capture="environment"
            onChange={handleInspectionReportChange} className="hidden" />
        </div>
      </Section>

      {/* Payment — public customers only */}
      {mode === "add" && !isDealer && (
        <Section title={t("section.payment")}>
          {/* Fee summary */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("payment.desc")}</p>
            </div>
            <p className="text-2xl font-extrabold text-blue-600" dir="ltr">
              {t("payment.fee")}
              <span className="text-sm font-medium text-gray-400 ms-1">{t("payment.currency")}</span>
            </p>
          </div>

          {/* Method selector */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            {/* Apple Pay */}
            <button type="button" onClick={() => setPaymentMethod("apple_pay")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "apple_pay" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-400 text-gray-700"
              }`}>
              <svg className="w-6 h-5 shrink-0" viewBox="0 0 24 16" fill="currentColor">
                <path d="M7.07 3.37c.41-.5.69-1.18.62-1.87-.6.03-1.34.4-1.77.9-.39.44-.73 1.15-.64 1.82.67.05 1.37-.34 1.79-.85zm.61.9c-.99-.06-1.83.56-2.3.56-.47 0-1.19-.53-1.97-.52C2.4 4.32 1.4 5.2 1 6.44c-.84 2.46.6 6.1 1.42 8.1.4.97.86 2.01 1.74 1.97.68-.02.94-.45 1.77-.45.82 0 1.05.45 1.77.44.9-.01 1.33-1 1.74-1.97.4-.99.55-1.95.56-2.01-.01 0-2.16-.84-2.17-3.31-.01-2.06 1.65-3.04 1.73-3.1-.93-1.39-2.38-1.54-2.68-1.55v-.29z"/>
              </svg>
              <span className="font-semibold text-sm">{t("payment.applePay")}</span>
              {paymentMethod === "apple_pay" && (
                <svg className="w-4 h-4 ms-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Google Pay */}
            <button type="button" onClick={() => setPaymentMethod("google_pay")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "google_pay" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 hover:border-gray-400 text-gray-700"
              }`}>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={paymentMethod === "google_pay" ? "#fff" : "#4285F4"}/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={paymentMethod === "google_pay" ? "#fff" : "#34A853"}/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={paymentMethod === "google_pay" ? "#fff" : "#FBBC05"}/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={paymentMethod === "google_pay" ? "#fff" : "#EA4335"}/>
              </svg>
              <span className="font-semibold text-sm">{t("payment.googlePay")}</span>
              {paymentMethod === "google_pay" && (
                <svg className="w-4 h-4 ms-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Card */}
            <button type="button" onClick={() => setPaymentMethod("card")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "card" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-400 text-gray-700"
              }`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-semibold text-sm">{t("payment.card")}</span>
              {paymentMethod === "card" && (
                <svg className="w-4 h-4 ms-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Card details form */}
          {paymentMethod === "card" && (
            <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50" dir="ltr">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("payment.cardName")}</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                  placeholder={t("payment.cardNamePlaceholder")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("payment.cardNumber")}</label>
                <input type="text" inputMode="numeric" value={cardNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCardNumber(raw.replace(/(.{4})/g, "$1 ").trim());
                  }}
                  placeholder={t("payment.cardNumberPlaceholder")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white tracking-widest font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t("payment.expiry")}</label>
                  <input type="text" inputMode="numeric" value={cardExpiry}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCardExpiry(raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw);
                    }}
                    placeholder={t("payment.expiryPlaceholder")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t("payment.cvv")}</label>
                  <input type="password" inputMode="numeric" value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder={t("payment.cvvPlaceholder")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-1 pb-8">
        {mode === "edit" && carId && (
          <button type="button" onClick={() => router.push(`/cars/${carId}/post`)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {t("action.generatePost")}
          </button>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push(cancelDest)}
            className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
            {t("action.cancel")}
          </button>
          <button type="submit" disabled={isSubmitting || uploadingMain || uploadingMore}
            className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? t("action.saving") : mode === "add" ? t("action.addCar") : t("action.save")}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function iCls(hasError?: boolean) {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${hasError ? "border-red-400" : "border-gray-300"}`;
}
