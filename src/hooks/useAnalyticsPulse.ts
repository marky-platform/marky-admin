import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAnalyticsPulse } from "../services/analyticsService";
import { mapAnalyticsPulse } from "../mappers/analyticsMapper";
import { AnalyticsPulse } from "../types/analytics";

export const ANALYTICS_PULSE_DAYS = 7;

export const useAnalyticsPulse = (open: boolean) =>
  useQuery<AnalyticsPulse>({
    queryKey: ["analyticsPulse", ANALYTICS_PULSE_DAYS],
    queryFn: async () =>
      mapAnalyticsPulse(await getAnalyticsPulse(ANALYTICS_PULSE_DAYS)),
    enabled: open,
    staleTime: 60_000,
    refetchInterval: open ? 60_000 : false,
    placeholderData: keepPreviousData,
    retry: 1,
  });
