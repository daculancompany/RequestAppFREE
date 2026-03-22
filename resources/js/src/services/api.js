import axios from "axios";
import Cookies from "js-cookie";


// Create axios instance
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true, // Required for Sanctum
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem("adminpro_token");

        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem(
                    "adminpro_refresh_token"
                );

                if (refreshToken) {
                    const response = await axios.post("/api/auth/refresh", {
                        refresh_token: refreshToken,
                    });

                    const { token } = response.data;

                    // Update token in localStorage
                    localStorage.setItem("adminpro_token", token);

                    // Update Authorization header
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed, logout user
                localStorage.removeItem("adminpro_user");
                localStorage.removeItem("adminpro_token");
                localStorage.removeItem("adminpro_refresh_token");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

// CSRF token setup for Laravel Sanctum
export const setupCSRF = async () => {
    try {
        await axios.get("/sanctum/csrf-cookie", {
            baseURL:  "http://127.0.0.1:8000/api/",  //process.env.REACT_APP_API_URL ||
            withCredentials: true,
        });
    } catch (error) {
        console.error("Failed to get CSRF token:", error);
    }
};

export default api;
