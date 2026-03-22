import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";
import { PER_PAGE } from "@//utils/constants";

export function useRequest(filters = {}) {
    const {
        group_id = null,
        page = 1,
        pageSize = PER_PAGE,
        type,
        status,
        startDate,
        endDate,
        search,
        ...restFilters
    } = filters;

    return useQuery({
        queryKey: [
            "request",
            {
                group_id,
                page,
                pageSize,
                type,
                status,
                startDate,
                endDate,
                search,
                ...restFilters,
            },
        ],
        queryFn: async () => {
            const params = {
                page,
                group_id,
                per_page: pageSize,
                ...(type && { type }),
                ...(status && { status }),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate }),
                ...(search && { search }),
            };

            const response = await axiosConfig.get("/requests", { params });

            return {
                data: response.data.data || [],
                pagination: response.data.pagination || {
                    current: page,
                    pageSize,
                    total: 0,
                    totalPages: 1,
                },
                filters: response.data.filters || {},
                status_counts: response.data.status_counts || {},
                type_counts: response.data.type_counts || {},
            };
        },
        keepPreviousData: true,
        enabled: group_id !== undefined,
    });
}

export function useCalendarView(filters = {}) {

    const {
        group_id = null,
        type,
        status,
        startDate,
        endDate,
        search,
        enabled = true,
    } = filters;

    return useQuery({
        queryKey: [
            "calendar-request",
            {
                group_id,
                type,
                status,
                startDate,
                endDate,
                search,
            },
        ],
        queryFn: async () => {
            const params = {
                group_id,
                ...(type && type !== "all" && { type }),
                ...(status && status !== "all" && { status }),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate }),
                ...(search && { search }),
            };

            const response = await axiosConfig.get("/requests/calendar-view", {
                params,
            });
    
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                data: response.data.data || [],
                meta: response.data.meta || {
                    total: 0,
                    month: null,
                    start_date: startDate,
                    end_date: endDate,
                },
                success: response.data.success,
            };
        },
        enabled: enabled && !!group_id,
        staleTime: 0, // Always fetch fresh data for calendar
        cacheTime: 0, // Don't cache calendar data
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });
}

export const useCreateRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            return await axiosConfig.post("/requests", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["request"] });
        },
    });
};

export const useUpdateRequestStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ formData, requestId }) => {
            return await axiosConfig.post(
                `/requests/${requestId}/update-status`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["request"] });
        },
    });
};
