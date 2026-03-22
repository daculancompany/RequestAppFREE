import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { usersApi } from "../../lib/axios";

// Users keys
export const userKeys = {
  all: ["users"],
  lists: () => ["users", "list"],
  list: (filters) => ["users", "list", filters],
  details: () => ["users", "detail"],
  detail: (id) => ["users", "detail", id],
};

// Queries
export const useUsers = (params) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(params).then((res) => res.data),
    keepPreviousData: true,
  });
};

export const useInfiniteUsers = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: ({ pageParam = 1 }) =>
      usersApi
        .getAll({ page: pageParam, limit })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return lastPage.users.length === limit
        ? nextPage
        : undefined;
    },
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      usersApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      usersApi.update(id, data).then((res) => res.data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
      queryClient.setQueryData(
        userKeys.detail(user.id),
        user
      );
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
};
