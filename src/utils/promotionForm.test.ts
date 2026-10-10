import {
  toIsoDateTime,
  splitIsoDateTime,
  buildPromotionClearPayload,
  buildProductPromotionFields,
  ProductPromotionFormValues,
} from "./promotionForm";

describe("toIsoDateTime / splitIsoDateTime round-trip", () => {
  it("round-trips local date+time through the same local basis", () => {
    const iso = toIsoDateTime("2026-08-15", "21:30");
    expect(iso).not.toBeNull();
    expect(splitIsoDateTime(iso)).toEqual({ date: "2026-08-15", time: "21:30" });
  });

  it("returns null when either date or time is missing", () => {
    expect(toIsoDateTime(undefined, "10:00")).toBeNull();
    expect(toIsoDateTime("2026-08-15", undefined)).toBeNull();
    expect(toIsoDateTime("", "")).toBeNull();
  });

  it("returns empty date/time for a missing/invalid ISO string", () => {
    expect(splitIsoDateTime(null)).toEqual({ date: "", time: "" });
    expect(splitIsoDateTime(undefined)).toEqual({ date: "", time: "" });
    expect(splitIsoDateTime("not-a-date")).toEqual({ date: "", time: "" });
  });
});

describe("buildProductPromotionFields", () => {
  const baseline: ProductPromotionFormValues = {
    isPromotionActive: true,
    promotionOption: "descuento",
    discountPercentage: 25,
    multibuyOption: "",
    countdownActive: true,
    promotionStartDate: "2026-08-15",
    promotionStartTime: "10:00",
    promotionEndDate: "2026-08-16",
    promotionEndTime: "23:59",
  };

  it("omits promo keys entirely on an unrelated-field edit of an existing product", () => {
    // The core regression test for Asana #8: editing price must never touch
    // the promo config that was set via the quick modal.
    const result = buildProductPromotionFields(baseline, baseline, true);
    expect(result).toEqual({});
  });

  it("always includes promo keys when creating a new product, even if unchanged", () => {
    const result = buildProductPromotionFields(baseline, baseline, false);
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        "promotion_starts_at",
        "promotion_ends_at",
        "discount_percentage",
        "multibuy_option",
      ]),
    );
  });

  it("includes promo keys on an existing product when the promo section was touched", () => {
    const edited: ProductPromotionFormValues = {
      ...baseline,
      discountPercentage: 40,
    };
    const result = buildProductPromotionFields(edited, baseline, true);

    expect(result.discount_percentage).toBe(40);
    expect(result.promotion_starts_at).toBe(
      toIsoDateTime(edited.promotionStartDate, edited.promotionStartTime),
    );
    expect(result.promotion_ends_at).toBe(
      toIsoDateTime(edited.promotionEndDate, edited.promotionEndTime),
    );
  });

  it("sends the FormData-safe clear payload when the promo is turned off on an existing product", () => {
    const turnedOff: ProductPromotionFormValues = {
      ...baseline,
      isPromotionActive: false,
    };
    const result = buildProductPromotionFields(turnedOff, baseline, true);
    expect(result).toEqual(buildPromotionClearPayload());
  });

  it("does not treat identical-value re-renders as a change", () => {
    const sameValues: ProductPromotionFormValues = { ...baseline };
    const result = buildProductPromotionFields(sameValues, baseline, true);
    expect(result).toEqual({});
  });
  describe("exclusivity of discount vs offer", () => {
    it("sends multibuy_option '' when Descuento is selected and a stale multibuy value remains", () => {
      const stale: ProductPromotionFormValues = {
        ...baseline,
        promotionOption: "descuento",
        discountPercentage: 30,
        multibuyOption: "3x2",
      };
      const result = buildProductPromotionFields(stale, baseline, false);
      expect(result.discount_percentage).toBe(30);
      expect(result.multibuy_option).toBe("");
    });

    it("sends discount_percentage 0 when Oferta is selected and a stale discount remains", () => {
      const stale: ProductPromotionFormValues = {
        ...baseline,
        promotionOption: "oferta",
        discountPercentage: 30,
        multibuyOption: "3x2",
      };
      const result = buildProductPromotionFields(stale, baseline, true);
      expect(result.discount_percentage).toBe(0);
      expect(result.multibuy_option).toBe("3x2");
    });
  });
});
