// Catálogo estable de alérgenos (MVP). Los `id` son los identificadores que se
// persisten en el backend (ver marky_backend/products/product_extras.py); las
// etiquetas y descripciones solo viven en el frontend.
export interface AllergenDefinition {
  id: string;
  label: string;
  description: string;
}

export const ALLERGENS: readonly AllergenDefinition[] = [
  { id: "milk", label: "Leche", description: "Leche y productos lácteos, como quesos, yogures, crema o mantequilla." },
  { id: "egg", label: "Huevo", description: "Huevo y productos elaborados o derivados del huevo." },
  { id: "gluten_cereals", label: "Cereales con gluten", description: "Trigo, centeno, cebada, avena, espelta y productos derivados." },
  { id: "tree_nuts", label: "Frutos secos", description: "Almendras, nueces, avellanas, pistachos, anacardos y otros frutos secos." },
  { id: "peanut", label: "Maní", description: "Maní y productos derivados, como mantequilla o aceite de maní." },
  { id: "soy", label: "Soja", description: "Soja y productos derivados, como lecitina, tofu o proteína de soja." },
  { id: "sesame", label: "Sésamo", description: "Semillas de sésamo y productos derivados." },
  { id: "fish", label: "Pescado", description: "Pescado y productos derivados." },
  { id: "crustaceans", label: "Crustáceos", description: "Camarón, langostino, cangrejo, langosta y otros crustáceos." },
  { id: "mollusks", label: "Moluscos", description: "Mejillones, almejas, ostras, pulpo, calamar y otros moluscos." },
  { id: "mustard", label: "Mostaza", description: "Mostaza y productos que la contienen o derivan de ella." },
  { id: "celery", label: "Apio", description: "Apio y productos que lo contienen, frescos o procesados." },
  { id: "lupin", label: "Altramuz / Lupino", description: "Altramuz o lupino y productos elaborados con este ingrediente." },
  { id: "sulfites", label: "Dióxido de azufre y sulfitos", description: "Sulfitos utilizados como conservantes en algunos alimentos y bebidas." },
];

const ALLERGEN_IDS = new Set(ALLERGENS.map((a) => a.id));

export const isKnownAllergenId = (id: string) => ALLERGEN_IDS.has(id);
