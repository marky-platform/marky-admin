import { Product } from "../types/product";
import { celiacToForm, presentationToForm } from "./productExtras";

// Builds a "duplicated" copy of a product to prefill the create form: strips
// the id, appends " (copia)" to the name, drops media (URL/file complications),
// and strips variant/addon ids so they're created fresh. Called directly on
// live (unsaved) Formik state from the edit form, so a row the user just
// soft-deleted (_delete: true, still in the array until the pending save
// tombstones it — see VariationsSection/ExtrasSection) must be filtered out
// here too, or it would resurrect as a normal row on the duplicate. Shared by
// the duplicate flow on the product edit form and the Product Grid card menu.
export const buildDuplicatedProduct = (product: Product): Product => {
  const values = product as any;
  const duplicated: Product = {
    ...values,
    id: undefined as any,
    name: `${values.name} (copia)`,
    media: [],
    // Los datos informativos se copian como estado de formulario, venga el
    // producto del form (ya en ese formato) o de la API (presentation/celiacInfo).
    featuredIngredients: values.featuredIngredients ?? [],
    allergens: values.allergens ?? [],
    presentationForm:
      values.presentationForm ?? presentationToForm(values.presentation),
    celiacForm: values.celiacForm ?? celiacToForm(values.celiacInfo),
    variants: (values.variants || [])
      .filter((v: any) => !v._delete)
      .map((v: any) => ({
        name: v.name,
        description: v.description,
        price: Number(v.price) || 0,
        image: undefined,
      })),
    addons: (values.addons || [])
      .filter((a: any) => !a._delete)
      .map((a: any) => ({
        name: a.name,
        price: Number(a.price) || 0,
      })),
  };

  delete duplicated.presentation;
  delete duplicated.celiacInfo;

  if (duplicated.category && typeof duplicated.category === "object") {
    duplicated.category = (duplicated.category as any).id;
  }

  return duplicated;
};
