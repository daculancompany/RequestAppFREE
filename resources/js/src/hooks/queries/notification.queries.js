// hooks/queries/notification.queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";

export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data } = await axiosConfig.get(`/notifications/realtime`);
            
            // Process the data to extract fields
            if (Array.isArray(data)) {
                return data.map(notification => {
                    // Data might already be an object or a JSON string
                    let parsedData = notification.data;
                    
                    // If it's a string, try to parse it
                    if (typeof parsedData === 'string') {
                        try {
                            parsedData = JSON.parse(parsedData || '{}');
                        } catch (error) {
                            console.error('Error parsing notification data:', error);
                            parsedData = {};
                        }
                    }

               
                    
                    return {
                        id: notification.id,
                        title: parsedData.title || 'Notification',
                        description: parsedData.message || '',
                        type: parsedData.type || notification.type || notification.notifiable_type || 'general',
                        status: 'pending',
                        timestamp: new Date(notification.created_at),
                        read: Boolean(notification.read),
                        data: parsedData,
                        employee: notification.user_name || 'Unknown',
                        raw: notification
                    };
                });
            }
            
            return [];
        },
        refetchInterval: 30000,
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (notificationId) => {
            const { data } = await axiosConfig.put(`/notifications/${notificationId}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["notifications"]);
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (notificationId) => {
            const { data } = await axiosConfig.delete(`/notifications/${notificationId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["notifications"]);
        },
    });
}

export const useNotificationsPage = () => {
    const { data: notifications = [], isLoading, refetch } = useNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteMutation = useDeleteNotification();
    
    const markAsRead = (id) => {
        markAsReadMutation.mutate(id);
    };
    
    const markAllAsRead = async () => {
        try {
            await axiosConfig.put('/notifications/mark-all-read');
            refetch();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };
    
    const deleteNotification = (id) => {
        deleteMutation.mutate(id);
    };
    
    const getUnreadCount = () => {
        return notifications.filter((n) => !n.read).length;
    };
    
    return {
        notifications,
        isLoading,
        refetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadCount,
    };
};