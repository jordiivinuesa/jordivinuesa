import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type NotificationType = "like" | "follow" | "comment";

export interface Notification {
    id: string;
    user_id: string;
    actor_id: string;
    type: string;
    post_id: string | null;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (!error && data) {
            console.log("Notificaciones pendientes:", data);
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    }, [user]);

    const markAsRead = useCallback(async () => {
        if (!user || notifications.length === 0) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (!error) {
            setNotifications([]);
        }
    }, [user, notifications]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel(`user-notifications-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    return {
        notifications,
        unreadCount: notifications.length,
        hasLikes: notifications.some((n) => n.type === "like"),
        hasFollows: notifications.some((n) => n.type === "follow"),
        loading,
        markAsRead,
    };
}
