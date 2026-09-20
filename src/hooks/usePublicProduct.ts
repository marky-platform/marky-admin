import { useQuery } from "@tanstack/react-query";
import { getPublicProduct } from "../services/publicService";
import { Product } from "../types/product";

const usePublicProduct = (businessId?: string, productId?: number) => {
  return useQuery<Product>({
    queryKey: ["public", "product", businessId, productId],
    queryFn: () =>
      getPublicProduct(businessId as string, productId as number),
    enabled: !!businessId && Number.isFinite(productId),
    staleTime: 5 * 60 * 1000,
  });
};

export default usePublicProduct;
