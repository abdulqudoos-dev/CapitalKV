import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "./config";
export const BASE_URL =API_URL || "https://backend.capitalkv.com"
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // If you need to add a token for authorization, you can add it here
    // Example: config.headers['Authorization'] = `Bearer ${yourToken}`;
    const token = Cookies.get("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);




api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export const fetcher = (url:string) => api.get(url).then(res => res.data)

export default api;
