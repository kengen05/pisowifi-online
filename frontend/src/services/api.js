import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// Payment Services
export const paymentService = {
  createPayment: (data) => api.post("/payments/create", data),
  confirmPayment: (paymentId, data) =>
    api.post(`/payments/confirm/${paymentId}`, data),
  getHistory: () => api.get("/payments/history"),
  getAllPayments: () => api.get("/payments/admin/all"),
  getStats: () => api.get("/payments/stats"),
};

// Voucher Services
export const voucherService = {
  create: (data) => api.post("/vouchers/create", data),
  getAll: () => api.get("/vouchers"),
  update: (voucherId, data) => api.put(`/vouchers/${voucherId}`, data),
  delete: (voucherId) => api.delete(`/vouchers/${voucherId}`),
};

// Activity Services
export const activityService = {
  getLog: (params) => api.get("/activity", { params }),
};

// Device Services
export const deviceService = {
  register: (data) => api.post("/devices/register", data),
  getAll: () => api.get("/devices"),
  getAllDevices: () => api.get("/devices/admin/all"),
  updateStatus: (deviceId, data) =>
    api.put(`/devices/${deviceId}/status`, data),
  deleteDevice: (deviceId) => api.delete(`/devices/${deviceId}`),
  deleteDeviceAdmin: (deviceId) => api.delete(`/devices/admin/${deviceId}`),
};

export default api;
