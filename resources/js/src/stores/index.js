import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Create store with middleware
export const createStore = (store) =>
    create(
        devtools(
            persist(store, {
                name: "app-storage",
                partialize: (state) => ({
                    // Specify what to persist
                    user: state.user,
                    theme: state.theme,
                }),
            })
        )
    );
