import axios from "axios";
import { API_BASE } from "../utils/constants";


const api  = axios.create({
  baseURL:  `${API_BASE.replace(/\/$/, "")}/api`, // adjust to your backend
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

console.log("API_BASE =", API_BASE);
export default api;
