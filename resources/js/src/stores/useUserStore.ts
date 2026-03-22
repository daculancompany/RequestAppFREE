// store/userStore.ts
import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { useMemo } from "react";

// -----------------------------
// Types
// -----------------------------

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

export interface UserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
}

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
}

export interface UserState {
    users: User[];
    selectedUser: User | null;
    filters: UserFilters;
    stats: UserStats;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (id: string, updated: Partial<User>) => void;
    removeUser: (id: string) => void;
    removeUsers: (ids: string[]) => void;

    selectUser: (user: User | null) => void;

    setFilters: (filters: Partial<UserFilters>) => void;
    resetFilters: () => void;

    setStats: (stats: Partial<UserStats>) => void;
    setLoading: (loading: boolean) => void;

    setError: (msg: string | null) => void;
    clearError: () => void;
}

// -----------------------------
// Store
// -----------------------------

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    selectedUser: null,

    filters: {
        search: "",
        role: "",
        status: "",
        sortBy: "created_at",
        sortOrder: "desc",
        page: 1,
        limit: 10,
    },

    stats: {
        total: 0,
        active: 0,
        inactive: 0,
    },

    isLoading: false,
    error: null,

    // ---------- Actions ----------

    setUsers: (users) => set({ users }),

    addUser: (user) =>
        set((state) => ({
            users: [user, ...state.users],
            stats: { ...state.stats, total: state.stats.total + 1 },
        })),

    updateUser: (id, updated) =>
        set((state) => ({
            users: state.users.map((u) =>
                u.id === id ? { ...u, ...updated } : u
            ),
        })),

    removeUser: (id) =>
        set((state) => ({
            users: state.users.filter((u) => u.id !== id),
            stats: {
                ...state.stats,
                total: Math.max(0, state.stats.total - 1),
            },
        })),

    removeUsers: (ids) =>
        set((state) => ({
            users: state.users.filter((u) => !ids.includes(u.id)),
            stats: {
                ...state.stats,
                total: Math.max(0, state.stats.total - ids.length),
            },
        })),

    selectUser: (user) => set({ selectedUser: user }),

    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    resetFilters: () =>
        set({
            filters: {
                search: "",
                role: "",
                status: "",
                sortBy: "created_at",
                sortOrder: "desc",
                page: 1,
                limit: 10,
            },
        }),

    setStats: (stats) =>
        set((state) => ({ stats: { ...state.stats, ...stats } })),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (msg) => set({ error: msg }),

    clearError: () => set({ error: null }),
}));

// -----------------------------
// Selectors (typed & stable)
// -----------------------------

export const useUsers = () => useUserStore((s) => s.users);
export const useSelectedUser = () => useUserStore((s) => s.selectedUser);
export const useUserFilters = () => useUserStore((s) => s.filters);
export const useUserStats = () => useUserStore((s) => s.stats);
export const useUserLoading = () => useUserStore((s) => s.isLoading);
export const useUserError = () => useUserStore((s) => s.error);

// -----------------------------
// Actions Hook (optimized)
// -----------------------------

export const useUserActions = () => {
    const setUsers = useUserStore((s) => s.setUsers);
    const addUser = useUserStore((s) => s.addUser);
    const updateUser = useUserStore((s) => s.updateUser);
    const removeUser = useUserStore((s) => s.removeUser);
    const removeUsers = useUserStore((s) => s.removeUsers);
    const selectUser = useUserStore((s) => s.selectUser);
    const setFilters = useUserStore((s) => s.setFilters);
    const resetFilters = useUserStore((s) => s.resetFilters);
    const setStats = useUserStore((s) => s.setStats);
    const setLoading = useUserStore((s) => s.setLoading);
    const setError = useUserStore((s) => s.setError);
    const clearError = useUserStore((s) => s.clearError);

    return {
        setUsers,
        addUser,
        updateUser,
        removeUser,
        removeUsers,
        selectUser,
        setFilters,
        resetFilters,
        setStats,
        setLoading,
        setError,
        clearError,
    };
};

// -----------------------------
// Derived Data Hook
// -----------------------------

export const useFilteredUsers = (): User[] => {
  const users = useUsers();
  const filters = useUserFilters();
  
  // Memoize the filtering logic
  return useMemo(() => {
    // Ensure users is always an array
    const safeUsers = Array.isArray(users) ? users : [];
    const { search, role, status } = filters;
    const searchLower = search?.toLowerCase() || '';
    
    return safeUsers.filter((user) => {
      // Check if user object is valid
      if (!user || typeof user !== 'object') return false;
      
      if (search) {
        const userName = user.name?.toLowerCase() || '';
        const userEmail = user.email?.toLowerCase() || '';
        
        if (
          !userName.includes(searchLower) &&
          !userEmail.includes(searchLower)
        ) {
          return false;
        }
      }

      if (role && user.role !== role) return false;
      if (status && user.status !== status) return false;

      return true;
    });
  }, [users, filters.search, filters.role, filters.status]);
};
