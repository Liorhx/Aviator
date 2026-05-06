import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";
const API = axios.create({ baseURL: `${API_URL}/api` });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  getProfile: () => API.get("/auth/profile"),
};

export const gameApi = {
  getHistory: () => API.get("/game/history"),
  getMyBets: () => API.get("/game/my-bets"),
};

export const adminApi = {
  getStats: () => API.get("/admin/stats"),
  getUsers: () => API.get("/admin/users"),
  updateUserBalance: (id, balance) => API.patch(`/admin/users/${id}/balance`, { balance }),
  getRounds: () => API.get("/admin/rounds"),
};

export default API;
