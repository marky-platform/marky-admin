import { FormikErrors, getIn } from "formik";
import { Product } from "../../../types/product";

// Maps each side-nav section to the Yup field(s) whose errors belong to it.
// Kept here (not just in ProductFormPage) so both the desktop SectionsNav
// and the mobile CompleteYourProductList compute the exact same state from
// the exact same source of truth.
export const SECTION_FIELDS: Record<string, string[]> = {
  Producto: ["name", "description", "price", "presentationForm"],
  Variaciones: ["variants"],
  "Adicionales o extras": ["addons"],
  "Destacar producto": [
    "promotionOption",
    "discountPercentage",
    "multibuyOption",
    "promotionStartDate",
    "promotionStartTime",
    "promotionEndDate",
    "promotionEndTime",
  ],
};

export const sectionHasError = (
  sectionName: string,
  errors: FormikErrors<Product>,
): boolean =>
  (SECTION_FIELDS[sectionName] ?? []).some(
    (field) => getIn(errors, field) !== undefined,
  );

// Full section names double as Formik/state keys (SECTION_FIELDS,
// activationFlags); the nav/mobile-list/header only ever show the shorter
// display label from the Figma copy.
export const getSectionDisplayName = (sectionName: string): string => {
  if (sectionName === "Adicionales o extras") return "Adicionales";
  if (sectionName === "Destacar producto") return "Destacados";
  return sectionName;
};

export type SectionNavState = "blue" | "red" | "green" | "empty";

// "Producto" is always mandatory (isOptional=false); Variaciones/Adicionales/
// Destacar producto are optional, and only count as "activated" while their
// switch(es) are on (see ProductFormPage's `activationFlags`). Because Yup
// only validates an optional section's fields when it's activated, an
// inactive optional section can never carry an error — "empty" and "red"
// never collide in practice.
export const getSectionNavState = (
  sectionName: string,
  selectedSection: string,
  formikErrors: FormikErrors<Product>,
  isActivated: boolean,
  isOptional: boolean,
  // Only gates whether a real error is allowed to render as "red" (true
  // once the user has clicked "Publicar" at least once) — it must NOT gate
  // whether a section can be "green". formikErrors here is always the
  // live, real Formik errors (see ProductFormPage), so completeness is
  // judged from actual validation, not from "not currently selected".
  canShowError: boolean,
): SectionNavState => {
  const hasError = sectionHasError(sectionName, formikErrors);

  // Error takes priority over "currently selected": otherwise navigating a
  // user straight to the section Publicar just flagged (see
  // ProductFormPage's handlePublishClick) makes that section "blue" and
  // hides the very red warning icon that was supposed to tell them what's
  // wrong — the Figma nav (node 5540:24337) always shows red for an
  // errored section regardless of selection; "currently selected" is
  // conveyed separately via the pill background/text in SectionsNav.
  if (canShowError && hasError) return "red";
  if (isOptional && !isActivated) return "empty";
  if (sectionName === selectedSection) return "blue";
  // Only genuinely valid sections read as "completed" — an incomplete
  // section that hasn't been flagged red yet is "empty" (pending), never
  // "green". This is the fix for the false-positive-completed bug.
  return hasError ? "empty" : "green";
};
