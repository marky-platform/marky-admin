import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";
import {
  updateBusinessLocations,
  BusinessLocationsReplacePayload,
  BusinessLocationsReplaceResponse,
} from "../services/businessService";

export const useUpdateBusinessLocations = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    BusinessLocationsReplaceResponse,
    any,
    BusinessLocationsReplacePayload
  >({
    mutationFn: updateBusinessLocations,
    successMessage: "Ubicaciones guardadas exitosamente",
    onSuccess: () => {
      // El backend reemplaza el set completo de ubicaciones en cada
      // guardado, así que se invalida (y no se reconstruye a mano) para
      // reflejar el estado real del servidor.
      queryClient.invalidateQueries({ queryKey: ["homePageData"] });
    },
  });
};
