import { Product3DModel } from "../types/product";

export interface Model3dPayload {
  glbFile?: File;
  usdzFile?: File;
  removeUsdz?: true;
  _delete?: true;
}

const isUpload = (value: unknown): value is File =>
  value instanceof File || value instanceof Blob;

/**
 * Builds the `model_3d` request payload from the form's `model3d` state.
 * Returns undefined when nothing changed so the key is omitted entirely and
 * the backend keeps the stored files. URL strings are never sent.
 */
export const buildModel3dPayload = (
  model: Product3DModel | null | undefined,
): Model3dPayload | undefined => {
  if (!model) return undefined;

  if (model._delete) {
    return model.id ? { _delete: true } : undefined;
  }

  const payload: Model3dPayload = {};
  if (isUpload(model.glbFile)) payload.glbFile = model.glbFile;
  if (isUpload(model.usdzFile)) {
    payload.usdzFile = model.usdzFile;
  } else if (model.removeUsdz && model.id) {
    payload.removeUsdz = true;
  }

  return Object.keys(payload).length ? payload : undefined;
};
