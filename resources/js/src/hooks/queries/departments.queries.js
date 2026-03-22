import { useQuery } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";

export function useUserDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: async () => {
            const { data } = await axiosConfig.get(`/departments`);
            return data || [];
        },
    });
}
