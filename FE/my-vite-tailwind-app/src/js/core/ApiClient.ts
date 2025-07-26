import axios from "axios";
import { getCookie } from "./Cookie";
import { getBackendDomain } from "./Domain";

class ApiClient {
  token;
  axiosInstance: any;
  constructor(contentType = "application/json") {
    const backendDomain = getBackendDomain();
    const token = getCookie("token");
    this.token = token ? token : "";

    this.axiosInstance = axios.create({
      headers: {
        "Content-Type": contentType,
        "ngrok-skip-browser-warning": "true"
      },
      baseURL: backendDomain + "api/"
    });
  }

  updateToken() {
    const token = getCookie("token");
    this.axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
  }

  async get(url: any, config = {}) {
    this.updateToken();
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post(url: any, data: any, config = {}) {
    this.updateToken();
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put(url: any, data: any, config = {}) {
    this.updateToken();
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async deconste(endpoint: any) {
    this.updateToken();
    const response = await this.axiosInstance.deconste(endpoint);
    return response.data;
  }
}

const apiClient = new ApiClient();
const fileApiClient = new ApiClient("multipart/form-data");

export default apiClient;
export { fileApiClient };
