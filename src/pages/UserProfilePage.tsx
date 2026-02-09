import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocial, type Post, type UserProfile } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/social/PostCard";
import CommentSheet from "@/components/social/CommentSheet";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  } = useSocial();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const isOwnProfile = user?.id === userId;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [profileData, postsData] = await Promise.all([
      fetchUserProfile(userId),
      fetchUserPosts(userId),
    ]);
    setProfile(profileData);
    setPosts(postsData);
    setLoading(false);
  }, [userId, fetchUserProfile, fetchUserPosts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollow = async () => {
    if (!userId || !profile) return;
    if (profile.is_following) {
      await unfollowUser(userId);
      setProfile((p) => p && { ...p, is_following: false, followers: p.followers - 1 });
    } else {
      await followUser(userId);
      setProfile((p) => p && { ...p, is_following: true, followers: p.followers + 1 });
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !isLiked, likes_count: p.likes_count + (isLiked ? -1 : 1) }
          : p
      )
    );
    await toggleLike(postId, isLiked);
  };

  const handleDelete = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
      <div className="px-4 pt-6 pb-4 animate-fade-in">
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
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{profile.followers}</p>
                <p className="text-[10px] text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{profile.following}</p>
                <p className="text-[10px] text-muted-foreground">Siguiendo</p>
              </div>
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
    </div>
  );
};

export default UserProfilePage;
