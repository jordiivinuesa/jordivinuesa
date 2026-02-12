import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocial, type Post, type UserProfile } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/social/PostCard";
import CommentSheet from "@/components/social/CommentSheet";
import FollowListSheet from "@/components/social/FollowListSheet";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    fetchUserProfile,
    fetchUserPosts,
    toggleLike,
    followUser,
    unfollowUser,
    fetchComments,
    addComment,
    deleteComment,
    deletePost,
    fetchFollowers,
    fetchFollowing,
  } = useSocial();

  // Use React Query with dynamic userId
  const { data: profile = null, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userId ? fetchUserProfile(userId) : null,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => userId ? fetchUserPosts(userId) : [],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: false,
  });

  const loading = profileLoading || postsLoading;

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [followList, setFollowList] = useState<{ open: boolean; type: "followers" | "following" }>({
    open: false,
    type: "followers",
  });
  const isOwnProfile = user?.id === userId;

  const handleFollow = async () => {
    if (!userId || !profile) return;
    // Optimistic update in cache
    queryClient.setQueryData<UserProfile | null>(['user-profile', userId], (old) => {
      if (!old) return old;
      return profile.is_following
        ? { ...old, is_following: false, followers: old.followers - 1 }
        : { ...old, is_following: true, followers: old.followers + 1 };
    });

    if (profile.is_following) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    // Optimistic update in cache
    queryClient.setQueryData<Post[]>(['user-posts', userId], (old = []) =>
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
    queryClient.setQueryData<Post[]>(['user-posts', userId], (old = []) =>
      old.filter((p) => p.id !== postId)
    );
    await deletePost(postId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">Usuario no encontrado</p>
        <button onClick={() => navigate("/social")} className="text-primary text-sm mt-2">
          Volver al feed
        </button>
      </div>
    );
  }

  const initial = (profile.display_name || "U")[0].toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-4 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Volver</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-lg font-bold font-display text-foreground">
              {profile.display_name || "Usuario"}
            </h1>

            <div className="flex items-center gap-4 mt-1">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{profile.posts_count}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <button
                onClick={() => setFollowList({ open: true, type: "followers" })}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-sm font-bold text-foreground">{profile.followers}</p>
                <p className="text-[10px] text-muted-foreground">Seguidores</p>
              </button>
              <button
                onClick={() => setFollowList({ open: true, type: "following" })}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-sm font-bold text-foreground">{profile.following}</p>
                <p className="text-[10px] text-muted-foreground">Siguiendo</p>
              </button>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <Button
            onClick={handleFollow}
            variant={profile.is_following ? "outline" : "default"}
            className="w-full mt-4 rounded-xl"
          >
            {profile.is_following ? (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Dejar de seguir
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Seguir
              </>
            )}
          </Button>
        )}
      </div>

      {/* Posts */}
      <div className="px-4 space-y-4 pb-6">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No hay publicaciones aún
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={setCommentPostId}
              onUserClick={(uid) => navigate(`/social/user/${uid}`)}
              onDelete={isOwnProfile ? handleDelete : undefined}
            />
          ))
        )}
      </div>

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

      <FollowListSheet
        open={followList.open}
        onOpenChange={(open) => setFollowList((prev) => ({ ...prev, open }))}
        userId={userId || ""}
        type={followList.type}
        fetchUsers={followList.type === "followers" ? fetchFollowers : fetchFollowing}
        onUserClick={(uid) => {
          if (uid === user?.id) {
            navigate("/profile");
          } else {
            navigate(`/social/user/${uid}`);
          }
        }}
      />
    </div>
  );
};

export default UserProfilePage;
