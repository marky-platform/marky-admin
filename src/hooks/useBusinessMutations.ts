import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";
import {
  updateBusiness,
  updateProfileImage,
  patchBusinessAccountInfo,
  BusinessAccountInfo,
  BusinessAccountInfoUpdatePayload,
  BusinessData,
} from "../services/businessService";

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useApiMutation<BusinessData, Error, Partial<BusinessData>>({
    mutationFn: updateBusiness,
    successMessage: "Negocio actualizado exitosamente",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homePageData"] });
    },
  });
};

export const useUpdateBusinessProfileImage = () => {
  const queryClient = useQueryClient();
  return useApiMutation<{ profile_image: string }, Error, FormData>({
    mutationFn: updateProfileImage,
    successMessage: "Imagen de perfil actualizada exitosamente",
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["homePageData"],
      });
    },
  });
};

export const useUpdateBusinessAccountInfo = () => {
  const queryClient = useQueryClient();
  return useApiMutation<
    BusinessAccountInfo,
    Error,
    BusinessAccountInfoUpdatePayload
  >({
    mutationFn: patchBusinessAccountInfo,
    successMessage: "Datos de cuenta actualizados exitosamente",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessAccountInfo"] });
      queryClient.invalidateQueries({
        queryKey: ["productCategoriesWithProducts"],
      });
      queryClient.invalidateQueries({ queryKey: ["homePageData"] });
    },
  });
};
