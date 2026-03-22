import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";

const getMembers = async () => {
    const { data } = await axiosConfig.get(`/members`);
    return data || [];
};

const getProfile = async () => {
    const { data } = await axiosConfig.get(`/profile`);
    return data;
};

const createMember = async (memberData) => {
    const { data } = await axiosConfig.post(`/members`, memberData);
    return data;
};

const updateMember = async ({ id, ...memberData }) => {
    const { data } = await axiosConfig.put(`/members/${id}`, memberData);
    return data;
};

const updateProfile = async (profileData) => {
    const { data } = await axiosConfig.post(`/update-profile`, profileData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

const deleteMember = async (id) => {
    const { data } = await axiosConfig.delete(`/members/${id}`);
    return data;
};

export const memberKeys = {
    all: ["members"],
    lists: () => [...memberKeys.all, "list"],
    list: (filters) => [...memberKeys.lists(), { filters }],
    details: () => [...memberKeys.all, "detail"],
    detail: (id) => [...memberKeys.details(), id],
    profile: ["profile"],
};

export const useMembers = (filters) => {
    return useQuery({
        queryKey: memberKeys.list(filters),
        queryFn: getMembers,
    });
};

export const useProfile = (options = {}) => {
    return useQuery({
        queryKey: memberKeys.profile,
        queryFn: getProfile,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
        ...options,
    });
};

export const useCreateMember = () => {
    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await axiosConfig.post(`/members`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMember,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: memberKeys.detail(variables.id),
            });
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.profile });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
};