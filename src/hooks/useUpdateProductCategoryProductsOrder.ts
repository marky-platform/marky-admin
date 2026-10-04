import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";
import { updateProductCategoryProductsOrder } from "../services/productService";

interface UpdateProductsOrderVariables {
  categoryId: number;
  productIds: number[];
}

const useUpdateProductCategoryProductsOrder = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, any, UpdateProductsOrderVariables>({
    mutationFn: ({ categoryId, productIds }) =>
      updateProductCategoryProductsOrder(categoryId, productIds),
    successMessage: "Orden de productos actualizado",
    onSuccess: () => {
      // Cubre tanto la key del Home como la del propio modal de orden.
      queryClient.invalidateQueries({
        queryKey: ["productCategoriesWithProducts"],
      });
    },
  });
};

export default useUpdateProductCategoryProductsOrder;
