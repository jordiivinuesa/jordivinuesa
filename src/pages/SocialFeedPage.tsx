import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocial, type Post } from "@/hooks/useSocial";
import PostCard from "@/components/social/PostCard";
import CreatePostDialog from "@/components/social/CreatePostDialog";
import CommentSheet from "@/components/social/CommentSheet";
import { Input } from "@/components/ui/input";

const SocialFeedPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    fetchFeed,
    createPost,
    deletePost,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
    searchUsers,
  } = useSocial();

  // Use React Query for feed data - cached for instant loading
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['social-feed'],
    queryFn: fetchFeed,
    staleTime: 2 * 60 * 1000, // 2 minutes - more aggressive caching
    refetchOnMount: false, // Don't refetch if data is fresh
  });

  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleLike = async (postId: string, isLiked: boolean) => {
    // Optimistic update in cache
    queryClient.setQueryData<Post[]>(['social-feed'], (old = []) =>
      old.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !isLiked, likes_count: p.likes_count + (isLiked ? -1 : 1) }
          : p
      )
    );
    await toggleLike(postId, isLiked);
  };

  const handleDelete = async (postId: string) => {
    // Optimistic update in cache
    queryClient.setQueryData<Post[]>(['social-feed'], (old = []) =>
      old.filter((p) => p.id !== postId)
    );
    await deletePost(postId);
  };

  const handleCreatePost = async (file: File, caption: string, isPublic: boolean) => {
    const result = await createPost(file, caption, isPublic);
    if (result) {
      // Invalidate cache to refetch with new post
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    }
    return result;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-3 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display">Social</h1>
              <p className="text-xs text-muted-foreground">Comparte tu progreso</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 pb-3 animate-fade-in">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="rounded-xl bg-secondary border-none"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="mt-2 bg-card rounded-xl overflow-hidden divide-y divide-border">
              {searchResults.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => {
                    navigate(`/social/user/${u.user_id}`);
                    setShowSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {(u.display_name || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{u.display_name || "Usuario"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="px-4 space-y-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay publicaciones aún.
              <br />
              ¡Sé el primero en compartir!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm font-semibold text-primary"
            >
              Crear publicación
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={setCommentPostId}
              onUserClick={(uid) => navigate(`/social/user/${uid}`)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create post dialog */}
      <CreatePostDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreatePost}
      />

      {/* Comment sheet */}
      <CommentSheet
        open={!!commentPostId}
        onOpenChange={(v) => !v && setCommentPostId(null)}
        postId={commentPostId}
        fetchComments={fetchComments}
        addComment={addComment}
        deleteComment={deleteComment}
        onUserClick={(uid) => {
          setCommentPostId(null);
          navigate(`/social/user/${uid}`);
        }}
      />
    </div>
  );
};

export default SocialFeedPage;
