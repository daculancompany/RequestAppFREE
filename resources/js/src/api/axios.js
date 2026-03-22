import axios from "axios";
import { config } from "./config";

// Token Service
export const tokenService = {
    getToken: () => localStorage.getItem(config.tokens.accessTokenKey),
    setToken: (token) =>
        localStorage.setItem(config.tokens.accessTokenKey, token),
    clearTokens: () => {
        Object.values(config.tokens).forEach((key) => {
            if (key.includes("Token") || key.includes("user")) {
                localStorage.removeItem(key);
            }
        });
    },
    getUser: () => {
        const user = localStorage.getItem(config.tokens.userKey);
        return user ? JSON.parse(user) : null;
    },
};

// Create Axios Instance
const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: config.api.baseURL,
        timeout: config.api.timeout,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        withCredentials: config.features.enableCSRF,
    });

    // Request Interceptor
    instance.interceptors.request.use(
        (requestConfig) => {
            const token = tokenService.getToken();
            if (token) {
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }

            if (config.features.enableLogging) {
                console.log(
                    `➡️ ${requestConfig.method?.toUpperCase()} ${
                        requestConfig.url
                    }`
                );
            }

            return requestConfig;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor
    instance.interceptors.response.use(
        (response) => {
            if (config.features.enableLogging) {
                console.log(
                    `✅ ${
                        response.status
                    } ${response.config.method?.toUpperCase()} ${
                        response.config.url
                    }`
                );
            }
            return response;
        },
        async (error) => {
            if (config.features.enableLogging) {
                console.error(
                    `❌ ${
                        error.response?.status || "NETWORK"
                    } ${error.config?.method?.toUpperCase()} ${
                        error.config?.url
                    }`
                );
            }

            // Handle 401 Unauthorized
            if (error.response?.status === 401) {
                tokenService.clearTokens();
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export const api = createAxiosInstance();

// API Helper Functions
export const apiHelper = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data, config = {}) => api.post(url, data, config),
    put: (url, data, config = {}) => api.put(url, data, config),
    patch: (url, data, config = {}) => api.patch(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),

    // File Upload
    upload: (url, file, fieldName = "file") => {
        const formData = new FormData();
        formData.append(fieldName, file);
        return api.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
