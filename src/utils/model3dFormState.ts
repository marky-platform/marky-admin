import { Product3DModel } from "../types/product";

// Transiciones puras del estado `model3d` del formulario de producto.
// `stored` es el valor crudo de Formik (puede estar marcado `_delete`).

type Stored = Product3DModel | null | undefined;

/** Un modelo guardado marcado para borrar: el GLB es obligatorio para reiniciarlo. */
export const isDeletePending = (stored: Stored): boolean =>
  !!stored?._delete;

const visible = (stored: Stored): Product3DModel | null =>
  stored && !stored._delete ? stored : null;

export const selectGlb = (stored: Stored, file: File): Product3DModel => {
  const model = visible(stored);
  if (model) return { ...model, glbFile: file, _delete: false };
  if (stored?.id) {
    // Modelo guardado que se había quitado: se reemplaza su GLB y se limpia
    // el USDZ viejo, que pertenecía al modelo descartado.
    return {
      id: stored.id,
      glbFile: file,
      usdzFile: null,
      removeUsdz: !!stored.usdzFile || !!stored.removeUsdz,
    };
  }
  return { glbFile: file, usdzFile: null };
};

/** Con un borrado pendiente no se acepta el USDZ: devuelve `stored` sin cambios. */
export const selectUsdz = (stored: Stored, file: File): Product3DModel | null => {
  if (isDeletePending(stored)) return stored ?? null;
  return {
    id: stored?.id,
    glbFile: stored?.glbFile ?? null,
    usdzFile: file,
    removeUsdz: false,
  };
};

export const removeGlb = (stored: Stored): Product3DModel | null =>
  stored?.id ? { ...stored, _delete: true } : null;

export const removeUsdz = (stored: Stored): Product3DModel | null => {
  const model = visible(stored);
  if (!model) return stored ?? null;
  return {
    ...model,
    usdzFile: null,
    // En un modelo guardado siempre se pide borrar el USDZ del servidor, aun
    // si el valor actual es un File de reemplazo (el backend tolera
    // `remove_usdz` sin USDZ guardado).
    removeUsdz: !!model.id,
  };
};
