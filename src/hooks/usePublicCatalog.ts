import { useQuery } from "@tanstack/react-query";
import { getPublicCatalog } from "../services/publicService";
import { PaginatedProductCategoriesResponse } from "../services/types";
import { CategoryWithProducts } from "../types/categoryWithProducts";

const usePublicCatalog = (businessId?: string, params?: any) => {
  return useQuery<PaginatedProductCategoriesResponse<CategoryWithProducts>>({
    queryKey: ["public", "catalog", businessId, params],
    queryFn: () => getPublicCatalog(businessId as string, params),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};

export default usePublicCatalog;
