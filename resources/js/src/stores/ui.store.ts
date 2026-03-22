import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeConfig } from "../types";

interface UIState {
    sidebarCollapsed: boolean;
    themeConfig: ThemeConfig;
    notifications: Notification[];
    isMobile: boolean;

    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setTheme: (themeConfig: Partial<ThemeConfig>) => void;
    toggleDarkMode: () => void;
    addNotification: (
        notification: Omit<Notification, "id" | "read" | "timestamp">
    ) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
    setIsMobile: (isMobile: boolean) => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    timestamp: Date;
}

export const uiStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            themeConfig: {
                themeName: "default",
                primaryColor: "#1890ff",
                borderRadius: 8,
                darkMode: false,
            },
            notifications: [],
            isMobile: false,

            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            setSidebarCollapsed: (collapsed) =>
                set({ sidebarCollapsed: collapsed }),

            setTheme: (themeConfig) =>
                set((state) => ({
                    themeConfig: { ...state.themeConfig, ...themeConfig },
                })),

            toggleDarkMode: () =>
                set((state) => ({
                    themeConfig: {
                        ...state.themeConfig,
                        darkMode: !state.themeConfig.darkMode,
                    },
                })),

            addNotification: (notification) =>
                set((state) => ({
                    notifications: [
                        {
                            ...notification,
                            id: Date.now().toString(),
                            read: false,
                            timestamp: new Date(),
                        },
                        ...state.notifications,
                    ].slice(0, 50), // Keep only last 50 notifications
                })),

            markNotificationAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                })),

            clearNotifications: () => set({ notifications: [] }),

            setIsMobile: (isMobile) => set({ isMobile }),
        }),
        {
            name: "ui-storage",
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                themeConfig: state.themeConfig,
            }),
        }
    )
);
