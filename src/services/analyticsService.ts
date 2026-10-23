import api from "./axiosConfig";
import {
  AnalyticsProductSort,
  AnalyticsPulseDays,
  AnalyticsPulseResponse,
} from "../types/analytics";

export const getAnalyticsPulse = async (
  days: AnalyticsPulseDays = 7,
  sort: AnalyticsProductSort = "views",
): Promise<AnalyticsPulseResponse> => {
  const response = await api.get<AnalyticsPulseResponse>(
    "/business/analytics/pulse/",
    { params: { days, sort } },
  );
  return response.data;
};
