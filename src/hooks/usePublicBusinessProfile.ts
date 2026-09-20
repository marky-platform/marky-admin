import { useQuery } from "@tanstack/react-query";
import {
  getPublicBusinessProfile,
  PublicBusinessProfile,
} from "../services/publicService";

const usePublicBusinessProfile = (businessId?: string) => {
  return useQuery<PublicBusinessProfile>({
    queryKey: ["public", "profile", businessId],
    queryFn: () => getPublicBusinessProfile(businessId as string),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};

export default usePublicBusinessProfile;
