import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE}/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("insforge_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("insforge_access_token");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const getMe = () => api.get("/users/me").then((r) => r.data);

// Analytics
export const getKPIs = () => api.get("/analytics/kpis").then((r) => r.data);
export const getChurnBySegment = (segment = "contract_type") =>
  api.get(`/analytics/churn-by-segment?segment=${segment}`).then((r) => r.data);
export const getCustomers = (skip = 0, limit = 50, riskMin = 0) =>
  api.get(`/analytics/customers?skip=${skip}&limit=${limit}&risk_min=${riskMin}`).then((r) => r.data);

// Predictions
export const predictSingle = (data: Record<string, unknown>) =>
  api.post("/predictions/predict", data).then((r) => r.data);
export const explainPrediction = (customerId: string) =>
  api.get(`/predictions/explain/${customerId}`).then((r) => r.data);
export const predictBatch = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/predictions/predict/batch", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

// Recommendations
export const getRecommendations = (customerId: string) =>
  api.get(`/recommendations/${customerId}`).then((r) => r.data);
export const generateRecommendations = (customerId: string) =>
  api.post(`/recommendations/generate/${customerId}`).then((r) => r.data);
export const getHighRiskRecommendations = (limit = 20) =>
  api.get(`/recommendations/high-risk/list?limit=${limit}`).then((r) => r.data);

// Monitoring
export const getDriftReports = () =>
  api.get("/monitoring/drift/reports").then((r) => r.data);
export const runDriftCheck = () =>
  api.post("/monitoring/drift/run").then((r) => r.data);
export const getModelMetrics = () =>
  api.get("/monitoring/model/metrics").then((r) => r.data);

// Upload
export const uploadChurnData = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/upload/churn-data", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
