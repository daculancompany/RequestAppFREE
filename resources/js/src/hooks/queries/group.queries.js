import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";

export function useGroups() {
    return useQuery({
        queryKey: ["groups"],
        queryFn: async () => {
            const { data } = await axiosConfig.get(`/groups`);
            return data || [];
        },
    });
}

export const useCreateGroupMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            console.log("Submitting FormData to /groups endpoint...");

            const response = await axiosConfig.post("/groups", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        },

        onMutate: async (formData) => {
            await queryClient.cancelQueries({ queryKey: ["groups"] });

            const previousGroups = queryClient.getQueryData(["groups"]);

            const name = formData.get("name") || "New Group";
            const code = formData.get("code") || "";
            const color = formData.get("color") || "#1890ff";
            const description = formData.get("description") || "";
            const approvers = JSON.parse(formData.get("approvers") || "[]");
            const signatories = JSON.parse(formData.get("signatories") || "[]");
            const capacity = parseInt(formData.get("capacity") || 50);
            const createdAt =
                formData.get("createdAt") || new Date().toISOString();
            const createdBy = formData.get("createdBy") || "You";
            const tags = formData.get("tags") || "";
            const maxLeaveDuration = parseInt(
                formData.get("maxLeaveDuration") || 30,
            );
            const autoApprove = formData.get("autoApprove") === "true";

            const optimisticGroup = {
                id: `temp-${Date.now()}`,
                name: name,
                code: code,
                description: description,
                color: color,
                coverImage: null,
                approvers: approvers,
                signatories: signatories,
                createdAt: createdAt,
                createdBy: createdBy,
                status: "active",
                tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
                stats: {
                    members: 0,
                    pending: 0,
                    approved: 0,
                    capacity: capacity,
                },
                settings: {
                    autoApprove: autoApprove,
                    maxLeaveDuration: maxLeaveDuration,
                },
            };

            queryClient.setQueryData(["groups"], (old) => {
                const oldData = old?.data || old || [];
                const newData = Array.isArray(oldData)
                    ? [optimisticGroup, ...oldData]
                    : [optimisticGroup];

                if (old && typeof old === "object" && !Array.isArray(old)) {
                    return {
                        ...old,
                        data: newData,
                    };
                }
                return newData;
            });

            return { previousGroups };
        },

        onSuccess: (response, formData, context) => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },

        onError: (err, formData, context) => {
            console.error("Error creating group:", err);

            if (context?.previousGroups) {
                queryClient.setQueryData(["groups"], context.previousGroups);
            }
        },

        ...options,
    });
};

export const useUpdateGroupMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }) => {
            console.log(`Updating group ${id}...`);

            formData.append('_method', 'PUT');
            
            const response = await axiosConfig.post(`/groups/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        },

        onMutate: async ({ id, formData }) => {
            await queryClient.cancelQueries({ queryKey: ["groups"] });
            await queryClient.cancelQueries({ queryKey: ["groups", id] });

            const previousGroups = queryClient.getQueryData(["groups"]);
            const previousGroup = queryClient.getQueryData(["groups", id]);

            const name = formData.get("name") || "";
            const code = formData.get("code") || "";
            const color = formData.get("color") || "#1890ff";
            const description = formData.get("description") || "";
            const approvers = JSON.parse(formData.get("approvers") || "[]");
            const signatories = JSON.parse(formData.get("signatories") || "[]");
            const members = JSON.parse(formData.get("members") || "[]");
            const capacity = parseInt(formData.get("capacity") || 50);
            const tags = formData.get("tags") || "";
            const maxLeaveDuration = parseInt(formData.get("maxLeaveDuration") || 30);
            const autoApprove = formData.get("autoApprove") === "true";

            const optimisticGroup = {
                id: id,
                group_name: name,
                group_code: code,
                description: description,
                group_color: color,
                group_image: null,
                approvers: approvers,
                signatories: signatories,
                members: members,
                tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
                settings: {
                    autoApprove: autoApprove,
                    maxLeaveDuration: maxLeaveDuration,
                },
                capacity: capacity,
            };

            queryClient.setQueryData(["groups"], (old) => {
                if (!old) return old;
                
                const oldData = old?.data || old || [];
                const newData = Array.isArray(oldData) 
                    ? oldData.map((group) => 
                        group.id === id ? { ...group, ...optimisticGroup } : group
                      )
                    : oldData;

                if (old && typeof old === "object" && !Array.isArray(old)) {
                    return {
                        ...old,
                        data: newData,
                    };
                }
                return newData;
            });

            queryClient.setQueryData(["groups", id], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        ...optimisticGroup,
                    }
                };
            });

            return { previousGroups, previousGroup };
        },

        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            queryClient.invalidateQueries({ queryKey: ["groups", variables.id] });
            
            if (options.onSuccess) {
                options.onSuccess(response, variables, context);
            }
        },

        onError: (err, variables, context) => {
            console.error("Error updating group:", err);

            if (context?.previousGroups) {
                queryClient.setQueryData(["groups"], context.previousGroups);
            }
            if (context?.previousGroup) {
                queryClient.setQueryData(["groups", variables.id], context.previousGroup);
            }

            if (options.onError) {
                options.onError(err, variables, context);
            }
        },

        ...options,
    });
};

export const useGroup = (id) => {
    return useQuery({
        queryKey: ["groups", id],
        queryFn: async () => {
            const { data } = await axiosConfig.get(`/groups/${id}`);
            return data || [];
        },
        enabled: !!id,
    });
};