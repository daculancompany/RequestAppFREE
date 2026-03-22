// API Configuration
export const config = {
    api: {
        baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
        sanctumURL: import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000",
        timeout: 10000,
        retryDelay: 1000,
        maxRetries: 3,
    },

    tokens: {
        accessTokenKey: "adminpro_token",
        refreshTokenKey: "adminpro_refresh_token",
        userKey: "adminpro_user",
        csrfTokenKey: "XSRF-TOKEN",
    },

    endpoints: {
        users: "/users",
        departments: "/departments",
        auth: {
            login: "/auth/login",
            logout: "/auth/logout",
            refresh: "/auth/refresh",
            me: "/auth/me",
        },
    },

    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        limits: [5, 10, 25, 50],
    },

    features: {
        enableLogging: import.meta.env.DEV,
        enableCSRF: true,
        autoRefreshToken: true,
    },
};
