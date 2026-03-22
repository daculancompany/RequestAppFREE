import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    login: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    clearError: () => void;
}

export const authStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            login: (user, token, refreshToken) =>
                set({
                    user,
                    token,
                    refreshToken,
                    isAuthenticated: true,
                    error: null,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
