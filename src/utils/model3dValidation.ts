import { Product3DModel } from "../types/product";

export const MAX_MODEL_3D_SIZE_BYTES = 25 * 1024 * 1024;

export type Model3dKind = "glb" | "usdz";

export const MODEL_3D_MISSING_GLB_MESSAGE =
  "Para agregar el modelo 3D sube primero el archivo GLB.";

/**
 * Validates a newly-selected 3D file (extension and size; browsers report
 * unreliable MIME types for these formats). Returns a user-facing error
 * message, or null if valid. Mirrors the backend's limits.
 */
export const validateModel3dFile = (
  file: File,
  kind: Model3dKind,
): string | null => {
  const label = kind.toUpperCase();
  if (!file.name.toLowerCase().endsWith(`.${kind}`)) {
    return `Formato no permitido para ${file.name}. Usa un archivo ${label} (.${kind}).`;
  }
  if (file.size > MAX_MODEL_3D_SIZE_BYTES) {
    return `El archivo ${label} supera el peso máximo permitido. Máximo permitido: 25MB.`;
  }
  return null;
};

/** A model must have a GLB unless it is being deleted (or there is no model). */
export const isModel3dValid = (model: Product3DModel | null | undefined) =>
  !model || !!model._delete || !!model.glbFile;
