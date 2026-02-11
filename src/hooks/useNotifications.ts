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

// Canal para comunicar instancias del hook en la misma pestaña
const NOTIFICATION_CHANNEL = "peak_notifications_internal";
const broadcast = typeof window !== "undefined" ? new BroadcastChannel(NOTIFICATION_CHANNEL) : null;

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
            console.log(">>> NOTIFICACIONES ACTIVAS:", data.length);
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    }, [user]);

    const markAsRead = useCallback(async () => {
        if (!user) return;

        console.log(">>> EJECUTANDO LIMPIEZA DE NOTIFICACIONES...");

        // Notificar a otras instancias en la misma pestaña inmediatamente
        broadcast?.postMessage({ type: "CLEAR_ALL" });
        setNotifications([]);

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) {
            console.error(">>> ERROR AL LIMPIAR EN BD:", error);
        } else {
            console.log(">>> LIMPIEZA COMPLETADA EN BASE DE DATOS");
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Escuchar limpieza interna (entre instancias del hook)
        const handleInternalMessage = (event: MessageEvent) => {
            if (event.data?.type === "CLEAR_ALL") {
                console.log(">>> LIMPIEZA INTERNA RECIBIDA (Broadcast)");
                setNotifications([]);
            }
        };
        broadcast?.addEventListener("message", handleInternalMessage);

        // Suscribirse a cambios en Realtime (desde otros dispositivos/pestañas)
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
                    console.log(">>> EVENTO REALTIME:", payload.eventType, payload);
                    if (payload.eventType === "INSERT") {
                        const newNotif = payload.new as Notification;
                        if (!newNotif.is_read) {
                            setNotifications((prev) => {
                                if (prev.some(n => n.id === newNotif.id)) return prev;
                                return [newNotif, ...prev];
                            });
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updatedNotif = payload.new as Notification;
                        if (updatedNotif.is_read) {
                            setNotifications((prev) => prev.filter(n => n.id !== updatedNotif.id));
                        }
                    } else if (payload.eventType === "DELETE") {
                        setNotifications((prev) => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            broadcast?.removeEventListener("message", handleInternalMessage);
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
