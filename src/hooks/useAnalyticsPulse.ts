import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAnalyticsPulse } from "../services/analyticsService";
import { mapAnalyticsPulse } from "../mappers/analyticsMapper";
import {
  AnalyticsProductSort,
  AnalyticsPulse,
  AnalyticsPulseDays,
} from "../types/analytics";

export const ANALYTICS_PULSE_DAYS: AnalyticsPulseDays = 7;

interface UseAnalyticsPulseOptions {
  /** El riel cerrado también muestra métricas (hoy, barras, delta). */
  enabled?: boolean;
  /** Solo con el panel abierto se refresca cada minuto. */
  live?: boolean;
  days?: AnalyticsPulseDays;
  sort?: AnalyticsProductSort;
}

export const useAnalyticsPulse = ({
  enabled = true,
  live = false,
  days = ANALYTICS_PULSE_DAYS,
  sort = "views",
}: UseAnalyticsPulseOptions = {}) =>
  useQuery<AnalyticsPulse>({
    queryKey: ["analyticsPulse", days, sort],
    queryFn: async () => mapAnalyticsPulse(await getAnalyticsPulse(days, sort)),
    enabled,
    staleTime: 60_000,
    refetchInterval: live ? 60_000 : false,
    placeholderData: keepPreviousData,
    retry: 1,
  });
