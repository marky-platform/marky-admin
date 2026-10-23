import api from "./axiosConfig";
import { AnalyticsPulseResponse } from "../types/analytics";

export const getAnalyticsPulse = async (
  days = 7,
): Promise<AnalyticsPulseResponse> => {
  const response = await api.get<AnalyticsPulseResponse>(
    "/business/analytics/pulse/",
    { params: { days } },
  );
  return response.data;
};
