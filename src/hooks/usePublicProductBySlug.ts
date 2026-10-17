import { useQuery } from "@tanstack/react-query";
import { getPublicProductBySlug } from "../services/publicService";
import { Product } from "../types/product";

const usePublicProductBySlug = (
  businessId?: string,
  categorySlug?: string,
  productSlug?: string,
) => {
  return useQuery<Product>({
    queryKey: ["public", "product", businessId, categorySlug, productSlug],
    queryFn: () =>
      getPublicProductBySlug(
        businessId as string,
        categorySlug as string,
        productSlug as string,
      ),
    enabled: !!businessId && !!categorySlug && !!productSlug,
    staleTime: 5 * 60 * 1000,
  });
};

export default usePublicProductBySlug;
