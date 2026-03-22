import api from "./api";
import { setupCSRF } from "./api";
import secureLocalStorage from "react-secure-storage";
import axiosConfig from "@/utils/axiosConfig";

export const authService = {
    async login(email, password) {
        try {
            // First get CSRF cookie
           // await setupCSRF();

            // Then login
            const response = await axiosConfig.post("auth/login", {
                email,
                password,
                device_name: "web_browser",
            });

            const { token, user, refresh_token } = response.data;

            // Store tokens and user data
            secureLocalStorage.setItem("access_token", token);
            secureLocalStorage.setItem("adminpro_refresh_token", refresh_token);
            secureLocalStorage.setItem("adminpro_user", JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    },

};
