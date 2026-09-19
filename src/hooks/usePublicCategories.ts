import { useQuery } from "@tanstack/react-query";
import { getPublicCategories } from "../services/publicService";
import { PaginatedResponse } from "../services/types";
import { ProductCategory } from "../services/productService";

const usePublicCategories = (businessId?: string) => {
  return useQuery<PaginatedResponse<ProductCategory>>({
    queryKey: ["public", "categories", businessId],
    queryFn: () => getPublicCategories(businessId as string),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};

export default usePublicCategories;
