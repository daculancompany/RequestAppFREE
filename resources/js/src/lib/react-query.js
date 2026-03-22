import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  mutations: {
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
