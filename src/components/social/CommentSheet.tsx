import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import type { PostComment } from "@/hooks/useSocial";

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  fetchComments: (postId: string) => Promise<PostComment[]>;
  addComment: (postId: string, content: string) => Promise<any>;
  deleteComment: (commentId: string) => Promise<void>;
  onUserClick: (userId: string) => void;
}

const CommentSheet = ({
  open,
  onOpenChange,
  postId,
  fetchComments,
  addComment,
  deleteComment,
  onUserClick,
}: CommentSheetProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && postId) {
      setLoading(true);
      fetchComments(postId).then((c) => {
        setComments(c);
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
      });
    } else {
      setComments([]);
      setInput("");
    }
  }, [open, postId, fetchComments]);

  const handleSend = async () => {
    if (!postId || !input.trim()) return;
    setSending(true);
    const result = await addComment(postId, input.trim());
    if (result) {
      setInput("");
      const updated = await fetchComments(postId);
      setComments(updated);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    }
    setSending(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="font-display text-base">
            Comentarios ({comments.length})
          </SheetTitle>
        </SheetHeader>

        {/* Comments list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No hay comentarios aún. ¡Sé el primero!
            </p>
          ) : (
            comments.map((c) => {
              const initial = (c.profile?.display_name || "U")[0].toUpperCase();
              return (
                <div key={c.id} className="flex gap-2.5 animate-fade-in">
                  <button
                    onClick={() => onUserClick(c.user_id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5"
                  >
                    {initial}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <button
                        onClick={() => onUserClick(c.user_id)}
                        className="text-sm font-semibold text-foreground"
                      >
                        {c.profile?.display_name || "Usuario"}
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{c.content}</p>
                  </div>
                  {user?.id === c.user_id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Añadir un comentario..."
            className="flex-1 rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentSheet;
