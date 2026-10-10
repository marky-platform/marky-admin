import { useCallback, useState } from "react";

export type CatalogViewMode = "grid" | "list";

const STORAGE_KEY = "catalog-view-mode";

const readStoredMode = (): CatalogViewMode => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
};

// Modo de visualización del catálogo (mosaico / lista). Se recuerda por
// navegador; sin valor guardado (o con el storage bloqueado) arranca en
// mosaico. Es solo presentación: no toca filtros ni resultados.
export const useCatalogViewMode = () => {
  const [viewMode, setViewModeState] = useState<CatalogViewMode>(readStoredMode);

  const setViewMode = useCallback((mode: CatalogViewMode) => {
    setViewModeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Sin persistencia: el modo sigue funcionando en memoria.
    }
  }, []);

  return { viewMode, setViewMode };
};

export default useCatalogViewMode;
