import axios from "axios";

// A deliberately separate axios instance for the public (unauthenticated)
// business/catalog pages. Reusing the shared `api` instance (axiosConfig.ts)
// would send a logged-in merchant's Bearer token on every public request —
// skewing price context before the backend's A2 fix and triggering the
// 401 → refresh/redirect churn interceptors on a page that must never
// require a session.
const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
});

publicApi.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = "es";
  return config;
});

export default publicApi;
