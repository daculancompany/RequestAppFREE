import { useQuery } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";

export function usePositions() {
    return useQuery({
        queryKey: ["positions"],
        queryFn: async () => {
            const { data } = await axiosConfig.get(`/positions`);
            return data || [];
        },
    });
}
