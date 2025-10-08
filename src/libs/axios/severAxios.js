import axios from "axios";
import { cookies } from "next/headers";
import { API_URL } from "../../utils/constants";

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.withCredentials = true;

const serverAxios = axios.create({
  baseURL: API_URL,
});

serverAxios.interceptors.request.use(
  async (config) => {
    const cookiesStore = await cookies();
    const lang = cookiesStore.get("NEXT_LOCALE")?.value.split("-")[1] || "ar";
    const token = cookiesStore.get("token")?.value || "";

    config.headers["Accept-Language"] = lang;
    config.headers["lang"] = lang;
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default serverAxios;
