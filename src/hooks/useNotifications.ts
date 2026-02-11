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

const SYNC_EVENT = "peak_notifications_sync";

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
            console.log("%c>>> NOTIFICACIONES CARGADAS:", "background: #222; color: #bada55", data.length);
        }
        setLoading(false);
    }, [user]);

    const markAsRead = useCallback(async () => {
        if (!user) return;

        console.log("%c>>> EJECUTANDO LIMPIEZA (markAsRead)...", "background: #222; color: #ff00ff");

        // 1. Limpiar localmente la instancia actual
        setNotifications([]);

        // 2. Avisar a otras partes de la web (como la barra inferior) que limpien ya
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { action: "CLEAR" } }));

        // 3. Guardar en Base de Datos
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) {
            console.error(">>> ERROR AL LIMPIAR EN BD:", error);
        } else {
            console.log(">>> LIMPIEZA COMPLETADA EN BD");
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Escuchar eventos de sincronización local (entre componentes)
        const handleSync = (e: any) => {
            if (e.detail?.action === "CLEAR") {
                console.log(">>> SINCRONIZACIÓN RECIBIDA: Limpiando iconos...");
                setNotifications([]);
            }
        };
        window.addEventListener(SYNC_EVENT, handleSync);

        // Suscribirse a cambios en Realtime
        const channel = supabase
            .channel(`user-notifs-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log(">>> CAMBIO EN BD DETECTADO:", payload.eventType);
                    if (payload.eventType === "INSERT") {
                        const newNotif = payload.new as Notification;
                        if (!newNotif.is_read) {
                            setNotifications((prev) => {
                                if (prev.some(n => n.id === newNotif.id)) return prev;
                                return [newNotif, ...prev];
                            });
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updated = payload.new as Notification;
                        if (updated.is_read) {
                            setNotifications((prev) => prev.filter(n => n.id !== updated.id));
                        }
                    } else if (payload.eventType === "DELETE") {
                        setNotifications((prev) => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status) => {
                console.log(">>> ESTADO REALTIME:", status);
            });

        return () => {
            window.removeEventListener(SYNC_EVENT, handleSync);
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    return {
        notifications,
        unreadCount: notifications.length,
        hasLikes: notifications.some((n) => n.type === "like"),
        hasFollows: notifications.some((n) => n.type === "follow"),
        hasShares: notifications.some((n) => n.type === "share"),
        loading,
        markAsRead,
    };
}
