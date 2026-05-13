import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export const usePaymentStore = create((set) => ({
  payments: [],
  stats: null,

  setPayments: (payments) => set({ payments }),
  setStats: (stats) => set({ stats }),
}));

export const useVoucherStore = create((set) => ({
  vouchers: [],

  setVouchers: (vouchers) => set({ vouchers }),
}));

export const useActivityStore = create((set) => ({
  activities: [],

  setActivities: (activities) => set({ activities }),
}));

export const useDeviceStore = create((set) => ({
  devices: [],

  setDevices: (devices) => set({ devices }),
}));
