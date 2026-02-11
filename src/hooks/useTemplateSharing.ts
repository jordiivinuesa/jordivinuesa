
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { WorkoutTemplate } from "@/store/useAppStore";

export interface SharedTemplate {
    id: string;
    sender_id: string;
    receiver_id: string;
    template_name: string;
    template_data: any;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    sender_profile?: {
        display_name: string | null;
        avatar_url: string | null;
    };
}

export function useTemplateSharing() {
    const { user } = useAuth();
    const [mutualFriends, setMutualFriends] = useState<any[]>([]);
    const [pendingShares, setPendingShares] = useState<SharedTemplate[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMutualFriends = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Get people I follow
            const { data: following } = await supabase
                .from("follows")
                .select("following_id")
                .eq("follower_id", user.id);

            // Get people who follow me
            const { data: followers } = await supabase
                .from("follows")
                .select("follower_id")
                .eq("following_id", user.id);

            const followingIds = following?.map(f => f.following_id) || [];
            const followerIds = followers?.map(f => f.follower_id) || [];

            // Intersection = mutual friends
            const mutualIds = followingIds.filter(id => followerIds.includes(id));

            if (mutualIds.length > 0) {
                const { data: profiles } = await supabase
                    .rpc("get_public_profiles", { user_ids: mutualIds });
                setMutualFriends(profiles || []);
            } else {
                setMutualFriends([]);
            }
        } catch (error) {
            console.error("Error fetching mutual friends:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const shareTemplate = useCallback(async (receiverId: string, template: WorkoutTemplate) => {
        if (!user) return false;
        try {
            const { error } = await (supabase
                .from("shared_templates" as any) as any)
                .insert({
                    sender_id: user.id,
                    receiver_id: receiverId,
                    template_name: template.name,
                    template_data: {
                        exercises: template.exercises
                    }
                });

            if (error) throw error;
            toast({ title: "Template compartido", description: "El usuario recibirá una notificación." });
            return true;
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al compartir", description: error.message });
            return false;
        }
    }, [user]);

    const fetchPendingShares = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await (supabase
                .from("shared_templates" as any) as any)
                .select("*")
                .eq("receiver_id", user.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const senderIds = [...new Set(data.map(s => (s as any).sender_id))] as string[];
                const { data: profiles } = await supabase
                    .rpc("get_public_profiles", { user_ids: senderIds });

                const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

                const enriched = data.map(s => ({
                    ...s,
                    sender_profile: profileMap.get(s.sender_id)
                }));

                setPendingShares(enriched);
            } else {
                setPendingShares([]);
            }
        } catch (error) {
            console.error("Error fetching pending shares:", error);
        }
    }, [user]);

    const updateShareStatus = useCallback(async (shareId: string, status: 'accepted' | 'rejected') => {
        if (!user) return false;
        try {
            const { error } = await (supabase
                .from("shared_templates" as any) as any)
                .update({ status })
                .eq("id", shareId)
                .eq("receiver_id", user.id);

            if (error) throw error;

            setPendingShares(prev => prev.filter(p => p.id !== shareId));
            return true;
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
            return false;
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchPendingShares();
        }
    }, [user, fetchPendingShares]);

    return {
        mutualFriends,
        pendingShares,
        loading,
        fetchMutualFriends,
        shareTemplate,
        fetchPendingShares,
        updateShareStatus
    };
}
