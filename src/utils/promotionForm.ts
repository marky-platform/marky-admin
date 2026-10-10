// Shared date/time serialization for the two promo surfaces that build a
// promo window from separate date+time inputs (ProductFormPage.tsx's
// "Destacar producto" section and ProductPromotionModal.tsx's quick modal).
// Both must produce byte-identical ISO strings for the same wall-clock
// input, and both must round-trip a stored UTC instant back to the same
// local date+time it was created from — see Asana ticket #8.

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Sanitizes raw "Descuento" percentage input at typing time: strips
 * everything but digits and a decimal point, and collapses any point after
 * the first one — so "12.5.6" becomes "12.56", not garbage. Kept as a
 * string (not cast to Number) so an in-progress value like "12." isn't
 * silently rounded down to "12" before the user can type the decimal
 * digits — Yup's number schema casts the final string on validation/submit.
 */
export const sanitizeDiscountInput = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
};

/** Local date+time inputs -> ISO instant (UTC), or null if either is empty. */
export const toIsoDateTime = (
  date: string | undefined,
  time: string | undefined,
): string | null => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`).toISOString();
};

/**
 * ISO instant -> local date+time inputs, both derived from the SAME local
 * basis. The previous per-form implementation (`parseDateTime` in
 * ProductFormPage.tsx) built the date from `toISOString()` (UTC) and the
 * time from `toTimeString()` (browser-local) — two different bases for the
 * same instant, which silently shifted the displayed date by a day in
 * negative-UTC-offset timezones (e.g. Paraguay, UTC-3/-4) on re-edit.
 */
export const splitIsoDateTime = (
  iso: string | null | undefined,
): { date: string; time: string } => {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { date, time };
};

/**
 * FormData-safe "clear the promotion" payload: objectToFormData
 * (utils/formData.ts) silently drops null/undefined keys, so sending real
 * `null`s for multibuy_option/promotion_starts_at/promotion_ends_at is a
 * no-op server-side — only discount_percentage: 0 would actually arrive.
 * Empty strings survive FormData and are normalized to NULL server-side by
 * ProductInputSerializer.to_internal_value (products/serializers.py).
 */
export const buildPromotionClearPayload = () => ({
  discount_percentage: 0,
  multibuy_option: "",
  promotion_starts_at: "",
  promotion_ends_at: "",
});

export interface ProductPromotionFormValues {
  isPromotionActive?: boolean;
  promotionOption?: string;
  discountPercentage?: number | string;
  multibuyOption?: string | string[];
  countdownActive?: boolean;
  promotionStartDate?: string;
  promotionStartTime?: string;
  promotionEndDate?: string;
  promotionEndTime?: string;
}

const PROMOTION_SECTION_FIELDS: (keyof ProductPromotionFormValues)[] = [
  "isPromotionActive",
  "promotionOption",
  "discountPercentage",
  "multibuyOption",
  "countdownActive",
  "promotionStartDate",
  "promotionStartTime",
  "promotionEndDate",
  "promotionEndTime",
];

/** True if any field the "Destacar producto" section owns differs from its initial value. */
export const promotionSectionChanged = (
  values: ProductPromotionFormValues,
  initialValues: ProductPromotionFormValues,
): boolean =>
  PROMOTION_SECTION_FIELDS.some((field) => values[field] !== initialValues[field]);

/**
 * Builds the promo-related keys (snake_case, ready to merge into the
 * create/update payload) for ProductFormPage.tsx's submit. Returns `{}`
 * (nothing to merge — the PATCH omits these keys entirely) when editing an
 * existing product and the promo section wasn't touched, so the backend's
 * partial update leaves the previously-saved promo config untouched instead
 * of overwriting it with defaults on every unrelated-field save (Asana
 * ticket #8). On create, or whenever the section *was* touched, the full
 * set is always returned — there's nothing to preserve on create, and an
 * explicit edit must always be able to set or clear the promo.
 */
export const buildProductPromotionFields = (
  values: ProductPromotionFormValues,
  initialValues: ProductPromotionFormValues,
  isEditingExistingProduct: boolean,
): Record<string, unknown> => {
  const touched =
    !isEditingExistingProduct ||
    promotionSectionChanged(values, initialValues);

  if (!touched) return {};

  if (!values.isPromotionActive) {
    return buildPromotionClearPayload();
  }

  const discount =
    values.discountPercentage && !isNaN(Number(values.discountPercentage))
      ? Number(values.discountPercentage)
      : 0;
  // coerce multibuy_option to a plain string (pick first if array)
  const multibuy =
    Array.isArray(values.multibuyOption) && values.multibuyOption.length > 0
      ? String(values.multibuyOption[0])
      : values.multibuyOption
        ? String(values.multibuyOption)
        : "";

  // A row carries ONE promotion type. The selected type is authoritative:
  // a stale value left over in the hidden branch must never be serialized,
  // or the backend would persist (and the card render) both badges.
  const isOffer =
    values.promotionOption === "oferta" ||
    (values.promotionOption !== "descuento" && !!multibuy);

  return {
    promotion_starts_at:
      toIsoDateTime(values.promotionStartDate, values.promotionStartTime) ??
      "",
    promotion_ends_at:
      toIsoDateTime(values.promotionEndDate, values.promotionEndTime) ?? "",
    discount_percentage: isOffer ? 0 : discount,
    multibuy_option: isOffer ? multibuy : "",
  };
};
