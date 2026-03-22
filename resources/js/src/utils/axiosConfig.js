import { message, Modal } from "antd";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { useLoadingStore } from "@/stores/loading.store";
import { BASE_URL } from "./constants";

const instance = axios.create({
    baseURL: BASE_URL + "api/",
});

// Track if a modal is already open
let isModalOpen = false;
let currentModal = null;

// Add request interceptor for loading effects
instance.interceptors.request.use(
    (config) => {
        const loadingStore = useLoadingStore.getState();
        return config;
    },
    (error) => {
        const loadingStore = useLoadingStore.getState();
        loadingStore.hideLoading();
        return Promise.reject(error);
    },
);

// Add response interceptor for success/error handling
instance.interceptors.response.use(
    (response) => {
        const loadingStore = useLoadingStore.getState();
        loadingStore.hideLoading();
        return response;
    },
    (error) => {
        const loadingStore = useLoadingStore.getState();
        loadingStore.hideLoading();

        const statusCode = error.response ? error.response.status : null;


        const isLoginError =
            error.config?.url?.includes("/login") ||
            error.config?.url?.includes("/auth") ||
            error.config?.url?.includes("/signin");

        if (statusCode === 401 && !isLoginError) {
       
            window.location.href = `/login?type=session-expired&link=${window.location.href}`;
            return Promise.reject(error);
        }

        const errorMessage =
            error?.response?.data?.message || "No error message to show.";

        // cooment kay dili mo duplicate sa post error
        // if (isModalOpen && currentModal) {
        //     // Update existing modal
        //     currentModal.update({
        //         title: `Error: ${statusCode}`,
        //         content: errorMessage,
        //     });
        // } else {
        //     // Create new modal
        //     currentModal = Modal.error({
        //         title: `Error: ${statusCode}`,
        //         content: errorMessage,
        //         onOk: () => {
        //             isModalOpen = false;
        //             currentModal = null;
        //         },
        //         onCancel: () => {
        //             isModalOpen = false;
        //             currentModal = null;
        //         }
        //     });
        //     isModalOpen = true;
        // }

        return Promise.reject(error);
    },
);

// Set auth token
const updateAuthToken = () => {
    const access_token = secureLocalStorage.getItem("access_token");
    instance.defaults.headers.common["Authorization"] =
        `Bearer ${access_token}`;
};

// Initialize auth token
updateAuthToken();

// Optional: Add a method to refresh token when needed
export const refreshAuthToken = (newToken) => {
    secureLocalStorage.setItem("access_token", newToken);
    updateAuthToken();
};

export default instance;
