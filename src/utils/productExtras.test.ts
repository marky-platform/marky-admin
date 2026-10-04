import {
  addFeaturedIngredient,
  buildCategoryPayload,
  buildPresentationSchema,
  buildProductExtrasFields,
  celiacFormToPayload,
  celiacToForm,
  defaultPresentationForm,
  normalizeCeliacForm,
  parseAllergenIds,
  parseCsvList,
  presentationFormToPayload,
  presentationToForm,
  serializeAllergenIds,
} from "./productExtras";
import { parseLocaleDecimal } from "./parseLocaleDecimal";
import { normalizeSearch } from "./normalizeSearch";
import { objectToFormData } from "./formData";
import { validateYupSchema, yupToFormErrors } from "formik";
import * as Yup from "yup";

describe("parseLocaleDecimal", () => {
  it.each([
    ["1,5", 1.5],
    ["1.5", 1.5],
    ["0", 0],
    ["22", 22],
    [" 3,25 ", 3.25],
  ])("parses %s", (raw, expected) => expect(parseLocaleDecimal(raw)).toBe(expected));

  it.each(["", "abc", "-1", "1,2,3", "1.2.3", "1e3", "1 5"])("rejects %p", (raw) =>
    expect(parseLocaleDecimal(raw)).toBeNull(),
  );
});

describe("featured ingredients", () => {
  it("trims, dedupes case-insensitively and keeps display spelling", () => {
    let list: string[] = [];
    list = addFeaturedIngredient(list, "  Tomate ").list;
    expect(addFeaturedIngredient(list, "tomate").error).toBeDefined();
    list = addFeaturedIngredient(list, "Albahaca").list;
    expect(list).toEqual(["Tomate", "Albahaca"]);
  });

  it("ignores empty entries and rejects commas", () => {
    expect(addFeaturedIngredient([], "   ")).toEqual({ list: [] });
    expect(addFeaturedIngredient([], "a, b").error).toBeDefined();
  });

  it("enforces the maximum of 8", () => {
    let list: string[] = [];
    for (let i = 0; i < 8; i++) list = addFeaturedIngredient(list, `i${i}`).list;
    const result = addFeaturedIngredient(list, "extra");
    expect(result.list).toHaveLength(8);
    expect(result.error).toBeDefined();
  });

  it("round-trips CSV", () => {
    expect(parseCsvList("A, B ,,C")).toEqual(["A", "B", "C"]);
    expect(parseCsvList(null)).toEqual([]);
  });
});

describe("allergens", () => {
  it("drops unknown legacy ids and serializes in catalog order", () => {
    expect(parseAllergenIds("egg,legacy,milk,egg")).toEqual(["egg", "milk"]);
    expect(serializeAllergenIds(["egg", "milk"])).toBe("milk,egg");
  });
});

describe("presentation", () => {
  const schema = buildPresentationSchema();
  const valid = (form: any) => schema.isValidSync(form);

  it("is null when no module is active", () => {
    expect(presentationFormToPayload(defaultPresentationForm())).toBeNull();
  });

  it("does not validate inactive modules, even with stale values", () => {
    expect(valid({ ...defaultPresentationForm(), amountValue: "abc", diameterCm: "-1" })).toBe(true);
  });

  it("clears stale values of inactive modules and of the other shape/type", () => {
    const payload = presentationFormToPayload({
      ...defaultPresentationForm(),
      amountEnabled: true,
      amountType: "units",
      amountValue: "12",
      amountUnit: "kg", // stale unit from a previous type
      dimensionsEnabled: true,
      shape: "round",
      diameterCm: "22,5",
      lengthCm: "30", // stale from rectangular
      yieldEnabled: false,
      minPeople: "4",
    });
    expect(payload).toEqual({
      version: 1,
      amount: { type: "units", value: 12, unit: null },
      dimensions: { shape: "round", diameterCm: 22.5, lengthCm: null, widthCm: null, heightCm: null },
      approximateYield: null,
    });
  });

  it("validates amount types", () => {
    const base = { ...defaultPresentationForm(), amountEnabled: true };
    expect(valid({ ...base, amountType: "units", amountValue: "1,5" })).toBe(false);
    expect(valid({ ...base, amountType: "units", amountValue: "0" })).toBe(false);
    expect(valid({ ...base, amountType: "units", amountValue: "3" })).toBe(true);
    expect(valid({ ...base, amountType: "weight", amountValue: "1,5" })).toBe(true);
    expect(valid({ ...base, amountType: "weight", amountValue: "0" })).toBe(false);
  });

  it("validates dimensions per shape", () => {
    const base = { ...defaultPresentationForm(), dimensionsEnabled: true };
    expect(valid({ ...base, shape: "round", diameterCm: "" })).toBe(false);
    expect(valid({ ...base, shape: "round", diameterCm: "20" })).toBe(true);
    expect(valid({ ...base, shape: "round", diameterCm: "20", heightCm: "0" })).toBe(false);
    expect(valid({ ...base, shape: "rectangular", lengthCm: "30" })).toBe(false);
    expect(valid({ ...base, shape: "rectangular", lengthCm: "30", widthCm: "20", heightCm: "6" })).toBe(true);
  });

  it("rejects values the backend would reject (out of bounds)", () => {
    const base = { ...defaultPresentationForm(), amountEnabled: true, amountType: "weight" };
    expect(valid({ ...base, amountValue: "1000001" })).toBe(false);
    expect(valid({ ...base, amountValue: "0,0001" })).toBe(false);
    expect(valid({ ...defaultPresentationForm(), yieldEnabled: true, minPeople: "1001" })).toBe(false);
  });

  it("validates yield range", () => {
    const base = { ...defaultPresentationForm(), yieldEnabled: true };
    expect(valid({ ...base, minPeople: "8" })).toBe(true);
    expect(valid({ ...base, minPeople: "0" })).toBe(false);
    expect(valid({ ...base, minPeople: "12", maxPeople: "15" })).toBe(true);
    expect(valid({ ...base, minPeople: "12", maxPeople: "10" })).toBe(false);
  });

  it("round-trips through the form state", () => {
    const presentation = {
      version: 1 as const,
      amount: { type: "weight" as const, value: 1.5, unit: "kg" as const },
      dimensions: { shape: "rectangular" as const, diameterCm: null, lengthCm: 30, widthCm: 20, heightCm: 6 },
      approximateYield: { minPeople: 12, maxPeople: 15 },
    };
    expect(presentationFormToPayload(presentationToForm(presentation))).toEqual(presentation);
  });
});

describe("celiac", () => {
  it("resets declarations when the master switch is off", () => {
    const off = normalizeCeliacForm({
      enabled: false,
      crossContaminationControl: true,
      glutenFreeGrains: true,
      certifiedProtocol: true,
    });
    expect(off).toEqual({
      enabled: false,
      crossContaminationControl: false,
      glutenFreeGrains: false,
      certifiedProtocol: false,
    });
    expect(celiacFormToPayload(off)).toBeNull();
  });

  it("allows enabled with zero declarations and hydrates safely", () => {
    const payload = celiacFormToPayload({ ...celiacToForm(null), enabled: true });
    expect(payload).toEqual({
      version: 1,
      crossContaminationControl: false,
      glutenFreeGrains: false,
      certifiedProtocol: false,
    });
    expect(celiacToForm(null).enabled).toBe(false);
    expect(celiacToForm(payload).enabled).toBe(true);
  });
});

describe("buildProductExtrasFields + multipart", () => {
  it("serializes everything as strings and uses '' to clear", () => {
    const cleared = buildProductExtrasFields({});
    expect(cleared).toEqual({
      featured_ingredients: "",
      allergens: "",
      presentation: "",
      celiac_info: "",
    });

    const fields = buildProductExtrasFields({
      featuredIngredients: ["Tomate", "Albahaca"],
      allergens: ["egg", "milk"],
      presentationForm: { ...defaultPresentationForm(), yieldEnabled: true, minPeople: "8" },
      celiacForm: { ...celiacToForm(null), enabled: true, glutenFreeGrains: true },
    });
    const formData = objectToFormData(fields);
    expect(formData.get("featured_ingredients")).toBe("Tomate,Albahaca");
    expect(formData.get("allergens")).toBe("milk,egg");
    expect(JSON.parse(formData.get("presentation") as string).approximateYield).toEqual({
      minPeople: 8,
      maxPeople: null,
    });
    expect(JSON.parse(formData.get("celiac_info") as string).glutenFreeGrains).toBe(true);
    expect(formData.get("celiac_info")).toContain("glutenFreeGrains"); // keys keep camelCase inside JSON
  });
});

describe("normalizeSearch", () => {
  it("is case and accent insensitive", () => {
    expect(normalizeSearch("  Maní ")).toBe("mani");
    expect(normalizeSearch("Sésamo")).toBe(normalizeSearch("SESAMO"));
  });
});

describe("presentation validation through Formik", () => {
  // Formik convierte "" en undefined antes de validar: regresión de un TypeError.
  it("reports an error (instead of throwing) for an empty min with a filled max", async () => {
    const schema = Yup.object({ presentationForm: buildPresentationSchema() });
    const values = {
      presentationForm: { ...defaultPresentationForm(), yieldEnabled: true, minPeople: "", maxPeople: "5" },
    };
    let errors: any = null;
    try {
      await validateYupSchema(values, schema);
    } catch (e) {
      errors = yupToFormErrors(e);
    }
    expect(errors?.presentationForm?.minPeople).toBeDefined();
  });
});

describe("parseLocaleDecimal thousands ambiguity", () => {
  it("rejects '1.500' but accepts '0.500' and '1,500'", () => {
    expect(parseLocaleDecimal("1.500")).toBeNull();
    expect(parseLocaleDecimal("0.500")).toBe(0.5);
    expect(parseLocaleDecimal("1,500")).toBe(1.5);
  });
});

describe("buildCategoryPayload", () => {
  it("sends '' to clear the category when editing, null when creating", () => {
    expect(buildCategoryPayload(null, true)).toBe("");
    expect(buildCategoryPayload(null, false)).toBeNull();
    expect(buildCategoryPayload({ id: 4 }, true)).toBe(4);
    expect(buildCategoryPayload(7, false)).toBe(7);
    expect(objectToFormData({ category: buildCategoryPayload(null, true) }).get("category")).toBe("");
  });
});
