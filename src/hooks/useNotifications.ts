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

// SHARED STATE SYSTEM
let globalNotifications: Notification[] = [];
let globalLoading = true;
const listeners = new Set<(data: { notifications: Notification[], loading: boolean }) => void>();

function notifyListeners() {
    listeners.forEach(listener => listener({
        notifications: [...globalNotifications],
        loading: globalLoading
    }));
}

export function useNotifications() {
    const { user } = useAuth();
    const [state, setState] = useState({ notifications: globalNotifications, loading: globalLoading });

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (!error && data) {
            console.log("%c>>> HOOK: Notificaciones cargadas de BD:", "color: #00ff00", data.length);
            globalNotifications = data as Notification[];
            globalLoading = false;
            notifyListeners();
        }
    }, [user]);

    const markAsRead = useCallback(async () => {
        if (!user) return;

        console.log("%c>>> HOOK: markAsRead ejecutado", "color: #00ffff; font-weight: bold;");

        // Optimistic update: limpiar localmente e informar a todos
        globalNotifications = [];
        notifyListeners();

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) {
            console.error(">>> HOOK: Error al limpiar en BD:", error);
        } else {
            console.log(">>> HOOK: Limpieza confirmada en BD");
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // Suscribirse a cambios locales
        const handleChange = (newState: { notifications: Notification[], loading: boolean }) => {
            setState(newState);
        };
        listeners.add(handleChange);

        // Si es la primera vez o no hay datos, cargar
        if (globalLoading) {
            fetchNotifications();
        }

        // Suscribirse a Realtime
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
                    console.log(">>> HOOK: Cambio detectado en Realtime:", payload.eventType);

                    if (payload.eventType === "INSERT") {
                        const newNotif = payload.new as Notification;
                        if (!newNotif.is_read && !globalNotifications.some(n => n.id === newNotif.id)) {
                            globalNotifications = [newNotif, ...globalNotifications];
                            notifyListeners();
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updated = payload.new as Notification;
                        if (updated.is_read) {
                            globalNotifications = globalNotifications.filter(n => n.id !== updated.id);
                            notifyListeners();
                        }
                    } else if (payload.eventType === "DELETE") {
                        globalNotifications = globalNotifications.filter(n => n.id !== payload.old.id);
                        notifyListeners();
                    }
                }
            )
            .subscribe((status) => {
                console.log(">>> HOOK: Estado suscripción Realtime:", status);
            });

        return () => {
            listeners.delete(handleChange);
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    return {
        notifications: state.notifications,
        unreadCount: state.notifications.length,
        hasLikes: state.notifications.some((n) => n.type === "like"),
        hasFollows: state.notifications.some((n) => n.type === "follow"),
        loading: state.loading,
        markAsRead,
    };
}
