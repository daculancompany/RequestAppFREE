import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  useInfiniteQuery,
  InfiniteData 
} from '@tanstack/react-query';
import { usersApi } from '../../lib/axios';
import { User } from '../../types';

// Users keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// Queries
export const useUsers = (params?: { page: number; limit: number; search?: string }) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(params).then((res) => res.data),
    keepPreviousData: true,
  });
};

export const useInfiniteUsers = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: ({ pageParam = 1 }) =>
      usersApi.getAll({ page: pageParam, limit }).then((res) => res.data),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return lastPage.users.length === limit ? nextPage : undefined;
    },
  });
};

export const useUser = (id: number) => {
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
    mutationFn: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) =>
      usersApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.update(id, data).then((res) => res.data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(user.id), user);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
};