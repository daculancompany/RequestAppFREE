import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { usersApi } from "../../api/usersApi";
import { useUserActions } from "../../stores/useUserStore";

// Query Keys - FIXED: Remove TypeScript syntax for JavaScript
export const userKeys = {
    all: ["users"],
    lists: () => ["users", "list"],
    list: (filters = {}) => {
        // Normalize filters for consistent query keys
        const normalizedFilters = {
            page: filters.page || 1,
            limit: filters.limit || 10,
            search: filters.search || "",
            role: filters.role || "",
            status: filters.status || "",
            sortBy: filters.sortBy || "created_at",
            sortOrder: filters.sortOrder || "desc",
        };
        return ["users", "list", JSON.stringify(normalizedFilters)];
    },
    details: () => ["users", "detail"],
    detail: (id) => ["users", "detail", String(id)],
    search: (query) => ["users", "search", query],
    stats: () => ["users", "stats"],
};

// Queries
export const useUsersQuery = (filters = {}, options = {}) => {
    const { setUsers, setStats, setLoading, setError } = useUserActions();

    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: async ({ signal }) => {
            setLoading(true);
            try {
                const response = await usersApi.getUsers(filters, { signal });
                const { users, pagination, stats } = response.data;

                // Update Zustand store
                setUsers(users || []);
                if (stats) setStats(stats);

                return {
                    users: users || [],
                    pagination: pagination || {
                        total: 0,
                        count: 0,
                        per_page: 10,
                        current_page: 1,
                        total_pages: 0,
                    },
                    stats: stats || { total: 0, active: 0, inactive: 0 },
                };
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (cacheTime is now gcTime in v5)
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options,
    });
};

export const useUserQuery = (id, options = {}) => {
    const { selectUser } = useUserActions();

    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async ({ signal }) => {
            if (!id) throw new Error("User ID is required");
            
            const response = await usersApi.getUser(id, { signal });
            const user = response.data;

            // Update Zustand store
            selectUser(user);

            return user;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: (failureCount, error) => {
            // Don't retry on 404 errors
            if (error.response?.status === 404) return false;
            return failureCount < 2;
        },
        ...options,
    });
};

export const useUsersStatsQuery = (options = {}) => {
    const { setStats } = useUserActions();

    return useQuery({
        queryKey: userKeys.stats(),
        queryFn: async ({ signal }) => {
            const response = await usersApi.getUserStats({ signal });
            const stats = response.data;

            // Update Zustand store
            setStats(stats || { total: 0, active: 0, inactive: 0 });

            return stats;
        },
        staleTime: 1000 * 60, // 1 minute
        ...options,
    });
};

export const useInfiniteUsersQuery = (filters = {}, options = {}) => {
    return useInfiniteQuery({
        queryKey: [...userKeys.lists(), "infinite", JSON.stringify(filters)],
        queryFn: async ({ pageParam = 1, signal }) => {
            const response = await usersApi.getUsers({
                ...filters,
                page: pageParam,
            }, { signal });
            
            const data = response.data;
            return {
                users: data.users || [],
                pagination: data.pagination || {
                    total: 0,
                    count: 0,
                    per_page: 10,
                    current_page: pageParam,
                    total_pages: 0,
                },
            };
        },
        getNextPageParam: (lastPage) => {
            const { pagination } = lastPage;
            return pagination.current_page < pagination.total_pages
                ? pagination.current_page + 1
                : undefined;
        },
        getPreviousPageParam: (firstPage) => {
            const { pagination } = firstPage;
            return pagination.current_page > 1
                ? pagination.current_page - 1
                : undefined;
        },
        initialPageParam: 1,
        ...options,
    });
};

export const useSearchUsersQuery = (query, options = {}) => {
    return useQuery({
        queryKey: userKeys.search(query),
        queryFn: async ({ signal }) => {
            if (!query || query.trim().length < 2) {
                return [];
            }
            const response = await usersApi.searchUsers(query, { signal });
            return response.data || [];
        },
        enabled: !!query && query.trim().length >= 2,
        staleTime: 1000 * 60, // 1 minute
        ...options,
    });
};

// Mutations
export const useCreateUserMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { addUser } = useUserActions();

    return useMutation({
        mutationFn: (userData) => usersApi.createUser(userData),
        onMutate: async (newUser) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            // Snapshot the previous value
            const previousUsers = queryClient.getQueryData(userKeys.lists());

            // Optimistically update the cache
            queryClient.setQueryData(userKeys.lists(), (old) => {
                if (!old) return { users: [newUser], pagination: {} };
                return {
                    ...old,
                    users: [newUser, ...old.users],
                };
            });

            return { previousUsers };
        },
        onSuccess: (response, variables, context) => {
            const newUser = response.data;

            // Update Zustand store
            addUser(newUser);

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.stats() });
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(userKeys.lists(), context.previousUsers);
            }
        },
        ...options,
    });
};

export const useUpdateUserMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { updateUser } = useUserActions();

    return useMutation({
        mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            // Snapshot previous values
            const previousUser = queryClient.getQueryData(userKeys.detail(id));
            const previousUsers = queryClient.getQueryData(userKeys.lists());

            // Optimistically update user detail
            if (previousUser) {
                queryClient.setQueryData(userKeys.detail(id), {
                    ...previousUser,
                    ...data,
                });
            }

            // Optimistically update user list
            if (previousUsers?.users) {
                queryClient.setQueryData(userKeys.lists(), {
                    ...previousUsers,
                    users: previousUsers.users.map(user =>
                        user.id === id ? { ...user, ...data } : user
                    ),
                });
            }

            // Update Zustand store optimistically
            updateUser(id, data);

            return { previousUser, previousUsers };
        },
        onSuccess: (response, { id, data }) => {
            const updatedUser = response.data;

            // Update Zustand store with actual data
            updateUser(id, updatedUser);

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        },
        onError: (error, { id }, context) => {
            // Rollback on error
            if (context?.previousUser) {
                queryClient.setQueryData(userKeys.detail(id), context.previousUser);
            }
            if (context?.previousUsers) {
                queryClient.setQueryData(userKeys.lists(), context.previousUsers);
            }
        },
        ...options,
    });
};

export const useDeleteUserMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { removeUser } = useUserActions();

    return useMutation({
        mutationFn: (id) => usersApi.deleteUser(id),
        onMutate: async (id) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });
            await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

            // Snapshot previous values
            const previousUsers = queryClient.getQueryData(userKeys.lists());
            const previousUser = queryClient.getQueryData(userKeys.detail(id));

            // Optimistically update the cache
            if (previousUsers?.users) {
                queryClient.setQueryData(userKeys.lists(), {
                    ...previousUsers,
                    users: previousUsers.users.filter(user => user.id !== id),
                });
            }

            // Remove user detail from cache
            queryClient.removeQueries({ queryKey: userKeys.detail(id) });

            // Update Zustand store optimistically
            removeUser(id);

            return { previousUsers, previousUser };
        },
        onSuccess: (_, id) => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.stats() });
        },
        onError: (error, id, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(userKeys.lists(), context.previousUsers);
            }
            if (context?.previousUser) {
                queryClient.setQueryData(userKeys.detail(id), context.previousUser);
            }
        },
        ...options,
    });
};

export const useBulkDeleteUsersMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { removeUsers } = useUserActions();

    return useMutation({
        mutationFn: (ids) => usersApi.bulkDeleteUsers(ids),
        onMutate: async (ids) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            // Snapshot previous value
            const previousUsers = queryClient.getQueryData(userKeys.lists());

            // Optimistically update the cache
            if (previousUsers?.users) {
                queryClient.setQueryData(userKeys.lists(), {
                    ...previousUsers,
                    users: previousUsers.users.filter(user => !ids.includes(user.id)),
                });
            }

            // Remove user details from cache
            ids.forEach(id => {
                queryClient.removeQueries({ queryKey: userKeys.detail(id) });
            });

            // Update Zustand store optimistically
            removeUsers(ids);

            return { previousUsers };
        },
        onSuccess: () => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.stats() });
        },
        onError: (error, ids, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(userKeys.lists(), context.previousUsers);
                
                // Restore user detail queries
                ids.forEach(id => {
                    queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
                });
            }
        },
        ...options,
    });
};

// Export users mutation
export const useExportUsersMutation = (options = {}) => {
    return useMutation({
        mutationFn: (filters) => usersApi.exportUsers(filters),
        ...options,
    });
};

// Import users mutation
export const useImportUsersMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file) => usersApi.importUsers(file),
        onSuccess: () => {
            // Invalidate all user queries
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        ...options,
    });
};

// Custom hook for user management
export const useUserManagement = () => {
    const createMutation = useCreateUserMutation();
    const updateMutation = useUpdateUserMutation();
    const deleteMutation = useDeleteUserMutation();

    return {
        createUser: createMutation.mutate,
        updateUser: updateMutation.mutate,
        deleteUser: deleteMutation.mutate,
        createUserAsync: createMutation.mutateAsync,
        updateUserAsync: updateMutation.mutateAsync,
        deleteUserAsync: deleteMutation.mutateAsync,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};