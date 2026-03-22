import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../lib/axios";
import { authStore } from "../../stores/auth.store";
import { LoginCredentials, RegisterData, User } from "../../types";

// Auth keys
export const authKeys = {
    all: ["auth"] as const,
    current: () => [...authKeys.all, "current"] as const,
};

// Queries
export const useCurrentUser = () => {
    return useQuery({
        queryKey: authKeys.current(),
        queryFn: () => authApi.getCurrentUser().then((res) => res.data),
        enabled: !!authStore.getState().token,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutations
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            authApi.login(credentials).then((res) => res.data),
        onSuccess: (data) => {
            authStore
                .getState()
                .login(data.user, data.token, data.refresh_token);
            queryClient.setQueryData(authKeys.current(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterData) =>
            authApi.register(data).then((res) => res.data),
        onSuccess: (data) => {
            authStore
                .getState()
                .login(data.user, data.token, data.refresh_token);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            authStore.getState().logout();
            queryClient.clear();
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<User>) =>
            authApi.updateProfile(data).then((res) => res.data),
        onSuccess: (user) => {
            authStore.getState().setUser(user);
            queryClient.setQueryData(authKeys.current(), user);
        },
    });
};
