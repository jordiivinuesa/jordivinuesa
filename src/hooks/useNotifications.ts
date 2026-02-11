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
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    }, [user]);

    const markAsRead = useCallback(async () => {
        if (!user) return;

        if (notifications.length > 0) {
            console.log("Intentando marcar como leídas:", notifications.length, "notificaciones");
        }

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) {
            console.error("Error al marcar como leídas:", error);
        } else {
            if (notifications.length > 0) console.log("Notificaciones marcadas como leídas en BD");
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Subscribe to ALL changes in notifications for this user
        const channel = supabase
            .channel(`user-notifications-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("Evento Realtime recibido:", payload.eventType, payload);
                    if (payload.eventType === "INSERT") {
                        const newNotif = payload.new as Notification;
                        if (!newNotif.is_read) {
                            setNotifications((prev) => {
                                // Evitar duplicados si fetch y realtime coinciden
                                if (prev.some(n => n.id === newNotif.id)) return prev;
                                return [newNotif, ...prev];
                            });
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updatedNotif = payload.new as Notification;
                        if (updatedNotif.is_read) {
                            // Si se marcó como leída (desde cualquier instancia), la quitamos
                            setNotifications((prev) => prev.filter(n => n.id !== updatedNotif.id));
                        }
                    } else if (payload.eventType === "DELETE") {
                        setNotifications((prev) => prev.filter(n => n.id !== payload.old.id));
                    }
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
