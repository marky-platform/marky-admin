import { ProductGridItem } from "../types/product";

/**
 * Separates the products whose position is fixed by their stopper (always
 * shown first: "Favorito del mes", then "Recomendado") from the ones the
 * admin can reorder. `sortable` keeps the order it came in.
 */
export const splitByPlacement = (
  products: ProductGridItem[],
): { pinned: ProductGridItem[]; sortable: ProductGridItem[] } => {
  const favorite = products.filter((p) => p.isFavorite);
  const recommended = products.filter((p) => !p.isFavorite && p.isRecommended);
  const sortable = products.filter((p) => !p.isFavorite && !p.isRecommended);
  return { pinned: [...favorite, ...recommended], sortable };
};

/** Full ordered id list the backend expects: pinned products first. */
export const buildProductOrderPayload = (
  pinned: ProductGridItem[],
  sortable: ProductGridItem[],
): number[] => [...pinned, ...sortable].map((p) => Number(p.id));
