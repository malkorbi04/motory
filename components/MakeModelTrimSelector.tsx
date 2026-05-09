"use client";

import { getModels, getTrims, MAKES } from "@/lib/carData";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  make: string;
  model: string;
  trim: string;
  errors?: { make?: string; model?: string };
  onChange: (field: "make" | "model" | "trim", value: string) => void;
}

const MAKES_LIST = [...MAKES];

export default function MakeModelTrimSelector({ make, model, trim, errors, onChange }: Props) {
  const { t } = useLanguage();
  const models = getModels(make);
  const trims = getTrims(make, model);

  const makeIsCustom = make !== "" && !MAKES_LIST.includes(make as typeof MAKES[number]);
  const modelIsCustom = model !== "" && models.length > 0 && !models.includes(model);
  const showCustomMakeInput = make === "Other" || makeIsCustom;
  const showCustomModelInput = modelIsCustom;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* MAKE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("field.make")} <span className="text-red-500">*</span>
        </label>
        <select
          value={showCustomMakeInput ? "Other" : make}
          onChange={(e) => {
            const val = e.target.value;
            onChange("make", val);
            onChange("model", "");
            onChange("trim", "");
          }}
          className={selectClass(!!errors?.make)}
        >
          <option value="">{t("select.make")}</option>
          {MAKES_LIST.filter((m) => m !== "Other").map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
          <option value="Other">{t("select.other")}</option>
        </select>
        {showCustomMakeInput && (
          <input
            type="text"
            value={makeIsCustom ? make : ""}
            onChange={(e) => {
              onChange("make", e.target.value || "Other");
              onChange("model", "");
              onChange("trim", "");
            }}
            placeholder={t("input.typeMake")}
            autoFocus
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {errors?.make && <p className="mt-1 text-xs text-red-600">{errors.make}</p>}
      </div>

      {/* MODEL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("field.model")} <span className="text-red-500">*</span>
        </label>
        {models.length > 0 ? (
          <>
            <select
              value={showCustomModelInput ? "__custom__" : model}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__custom__") {
                  onChange("model", "");
                  onChange("trim", "");
                } else {
                  onChange("model", val);
                  onChange("trim", "");
                }
              }}
              disabled={!make || make === "Other"}
              className={selectClass(!!errors?.model)}
            >
              <option value="">{t("select.model")}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__custom__">{t("select.other")}</option>
            </select>
            {showCustomModelInput && (
              <input
                type="text"
                value={model}
                onChange={(e) => {
                  onChange("model", e.target.value);
                  onChange("trim", "");
                }}
                placeholder={t("input.typeModel")}
                autoFocus
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </>
        ) : (
          <input
            type="text"
            value={model}
            onChange={(e) => {
              onChange("model", e.target.value);
              onChange("trim", "");
            }}
            placeholder={make ? t("input.typeModel") : t("input.selectMakeFirst")}
            disabled={!make}
            className={selectClass(!!errors?.model)}
          />
        )}
        {errors?.model && <p className="mt-1 text-xs text-red-600">{errors.model}</p>}
      </div>

      {/* TRIM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("field.trim")}
        </label>
        {trims.length > 0 ? (
          <>
            <select
              value={trims.includes(trim) ? trim : trim ? "__custom__" : ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange("trim", val === "__custom__" ? "" : val);
              }}
              disabled={!model}
              className={selectClass()}
            >
              <option value="">{t("select.trim")}</option>
              {trims.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom__">{t("select.other")}</option>
            </select>
            {trim && !trims.includes(trim) && (
              <input
                type="text"
                value={trim}
                onChange={(e) => onChange("trim", e.target.value)}
                placeholder={t("input.typeTrim")}
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </>
        ) : (
          <input
            type="text"
            value={trim}
            onChange={(e) => onChange("trim", e.target.value)}
            placeholder={model ? t("input.trimOptional") : t("input.selectModelFirst")}
            disabled={!model}
            className={selectClass()}
          />
        )}
      </div>
    </div>
  );
}

function selectClass(hasError?: boolean) {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
    hasError ? "border-red-400" : "border-gray-300"
  }`;
}
