import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Terjadi kesalahan. Coba lagi.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export function formatMoney(amount, currency = "Rp") {
  const n = Number(amount || 0);
  return `${currency}${n.toLocaleString("id-ID")}`;
}

// Resolve an image/media path to an absolute URL that follows the configured
// backend domain. Absolute (http...) URLs are returned unchanged.
export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${process.env.REACT_APP_BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export { API };
export default api;
