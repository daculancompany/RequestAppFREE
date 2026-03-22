// config.js
const isDevelopment =
    import.meta.env.DEV || process.env.NODE_ENV === "development";

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

    headers: {
        accept: "application/json",
        contentType: "application/json",
        requestedWith: "XMLHttpRequest",
        authorizationPrefix: "Bearer ",
    },

    endpoints: {
        refreshToken: "/auth/refresh",
        csrfCookie: "/sanctum/csrf-cookie",
        login: "/auth/login",
        logout: "/auth/logout",
    },

    environment: {
        isDevelopment,
        isProduction: !isDevelopment,
    },

    features: {
        enableLogging: isDevelopment,
        enableCSRF: true,
        autoRefreshToken: true,
    },

    routes: {
        login: "/login",
        dashboard: "/dashboard",
        unauthorized: "/unauthorized",
    },
};
