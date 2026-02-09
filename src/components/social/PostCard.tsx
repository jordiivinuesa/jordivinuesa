import { Heart, MessageCircle, Trash2, Globe, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Post } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean) => void;
  onComment: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, onLike, onComment, onUserClick, onDelete }: PostCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;
  const initial = (post.profile?.display_name || "U")[0].toUpperCase();

  return (
    <div className="bg-card rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => onUserClick(post.user_id)}
          className="flex items-center gap-2.5 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
            {post.profile?.avatar_url ? (
              <img src={post.profile.avatar_url} className="h-full w-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {post.profile?.display_name || "Usuario"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {post.is_public ? (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <img
        src={post.image_url}
        alt={post.caption || "Publicación"}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />

      {/* Actions & Caption */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id, post.is_liked)}
            className="flex items-center gap-1.5 transition-transform active:scale-90"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                post.is_liked ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
            <span className="text-xs font-semibold text-foreground">{post.likes_count}</span>
          </button>

          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1.5"
          >
            <MessageCircle className="h-5 w-5 text-foreground" />
            <span className="text-xs font-semibold text-foreground">{post.comments_count}</span>
          </button>
        </div>

        {post.caption && (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{post.profile?.display_name || "Usuario"} </span>
            {post.caption}
          </p>
        )}

        {post.comments_count > 0 && (
          <button
            onClick={() => onComment(post.id)}
            className="text-xs text-muted-foreground"
          >
            Ver {post.comments_count} comentario{post.comments_count !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
