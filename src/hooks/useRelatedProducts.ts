import { useMemo } from "react";
import { CategoryWithProducts } from "../types/categoryWithProducts";
import { Product, ProductGridItem } from "../types/product";
import usePublicCatalog from "./usePublicCatalog";
import useProductCategoriesWithProducts from "./useProductCategoriesWithProducts";

// Una fila en el Figma de escritorio (5 columnas a 1440px).
export const RELATED_PRODUCTS_LIMIT = 5;

interface RelatedProducts {
  category: CategoryWithProducts | null;
  products: ProductGridItem[];
}

// Productos de la misma categoría, sin el actual. No hay un endpoint de
// "relacionados": se reutiliza el catálogo filtrado por categoría, que ya trae
// los productos en el orden de visualización (stopper, orden manual, id) y con
// las promociones resueltas. Con `businessId` usa el catálogo público
// (anónimo); sin él, el del administrador.
const useRelatedProducts = (
  product: Product,
  businessId?: string,
): RelatedProducts => {
  const categoryId = product.category?.id ?? null;
  const isPublic = Boolean(businessId);
  const params = { ids: String(categoryId) };

  const adminQuery = useProductCategoriesWithProducts(params, {
    enabled: !isPublic && categoryId !== null,
  });
  const publicQuery = usePublicCatalog(
    isPublic && categoryId !== null ? businessId : undefined,
    params,
  );
  const data = isPublic ? publicQuery.data : adminQuery.data;

  return useMemo(() => {
    // La respuesta puede incluir además el grupo sintético "Sin categoría".
    const category =
      categoryId === null
        ? null
        : (data?.results.find((c) => c.id === categoryId) ?? null);
    const products = (category?.products ?? [])
      .filter((p) => p.id !== product.id)
      .slice(0, RELATED_PRODUCTS_LIMIT);
    return { category, products };
  }, [data, categoryId, product.id]);
};

export default useRelatedProducts;
