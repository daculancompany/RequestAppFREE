import { api, apiHelper } from "./axios";
import { config } from "./config";

export const usersApi = {
    // Get all users with pagination and filters
    getUsers: (params = {}) => {
        const defaultParams = {
            page: config.pagination.defaultPage,
            limit: config.pagination.defaultLimit,
            ...params,
        };

        return api.get(config.endpoints.users, { params: defaultParams });
    },

    // Get single user by ID
    getUser: (id) => api.get(`${config.endpoints.users}/${id}`),

    // Create new user
    createUser: (userData) => api.post(config.endpoints.users, userData),

    // Update user
    updateUser: (id, userData) =>
        api.put(`${config.endpoints.users}/${id}`, userData),

    // Partial update
    patchUser: (id, userData) =>
        api.patch(`${config.endpoints.users}/${id}`, userData),

    // Delete user
    deleteUser: (id) => api.delete(`${config.endpoints.users}/${id}`),

    // Bulk delete users
    bulkDeleteUsers: (ids) =>
        api.post(`${config.endpoints.users}/bulk-delete`, { ids }),

    // Search users
    searchUsers: (query, params = {}) =>
        api.get(`${config.endpoints.users}/search`, {
            params: { q: query, ...params },
        }),

    // Export users
    exportUsers: (params = {}) =>
        api.get(`${config.endpoints.users}/export`, {
            params,
            responseType: "blob",
        }),

    // Import users
    importUsers: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`${config.endpoints.users}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Get user statistics
    getUserStats: () => api.get(`${config.endpoints.users}/stats`),
};
