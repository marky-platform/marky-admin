import { useRef } from "react";

export interface FilterCounts {
  promotion: number;
  featured: number;
}

// Contadores de Promociones / Destacados del catálogo (`filter_counts`).
// Dependen solo de la selección de categorías, pero llegan dentro de la misma
// respuesta que la lista filtrada: mientras esa query recarga (al activar una
// píldora o cambiar de categoría) los datos son `undefined` y los contadores
// desaparecían. Este hook conserva el último par recibido y solo lo reemplaza
// cuando llega uno nuevo, así ambos números se actualizan juntos.
// `resetKey` (p. ej. el negocio) descarta lo retenido al cambiar de catálogo.
const useRetainedFilterCounts = (
  counts: Partial<FilterCounts> | undefined,
  resetKey?: string,
): FilterCounts | undefined => {
  const retained = useRef<{ key?: string; counts: FilterCounts }>();

  if (
    typeof counts?.promotion === "number" &&
    typeof counts?.featured === "number"
  ) {
    retained.current = {
      key: resetKey,
      counts: { promotion: counts.promotion, featured: counts.featured },
    };
  }

  const current = retained.current;
  return current && current.key === resetKey ? current.counts : undefined;
};

export default useRetainedFilterCounts;
