import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { ChatMessage } from "./useAICoach";

export function useChatPersistence() {
  const { user } = useAuth();

  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!data || data.length === 0) return [];

    return data.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }, [user]);

  const saveMessage = useCallback(async (msg: ChatMessage) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      id: msg.id,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
  }, [user]);

  const clearChat = useCallback(async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
  }, [user]);

  return { loadMessages, saveMessage, clearChat };
}
