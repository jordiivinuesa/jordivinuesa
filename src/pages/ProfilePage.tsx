import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Loader2, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocial, type Post, type UserProfile } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/social/PostCard";
import CommentSheet from "@/components/social/CommentSheet";
import FollowListSheet from "@/components/social/FollowListSheet";
import { useNotifications } from "@/hooks/useNotifications";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { markAsRead } = useNotifications();
    const {
        fetchUserProfile,
        fetchUserPosts,
        toggleLike,
        fetchComments,
        addComment,
        deleteComment,
        deletePost,
        fetchFollowers,
        fetchFollowing,
    } = useSocial();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [followList, setFollowList] = useState<{ open: boolean; type: "followers" | "following" }>({
        open: false,
        type: "followers",
    });

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [profileData, postsData] = await Promise.all([
            fetchUserProfile(user.id),
            fetchUserPosts(user.id),
        ]);
        setProfile(profileData);
        setPosts(postsData);
        setLoading(false);
        markAsRead();
    }, [user, fetchUserProfile, fetchUserPosts, markAsRead]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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

    if (!profile) return null;

    const initial = (profile.display_name || "U")[0].toUpperCase();

    return (
        <div className="min-h-[calc(100vh-80px)] pb-10">
            {/* Header */}
            <div className="px-4 pt-6 pb-4 animate-fade-in text-foreground">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold font-display">Mi Perfil</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/settings")}
                        className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold border-2 border-background shadow-xl">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            initial
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold font-display leading-tight mb-3">
                            {profile.display_name || "Usuario"}
                        </h2>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-lg font-bold">{profile.posts_count}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Posts</p>
                            </div>
                            <button
                                onClick={() => setFollowList({ open: true, type: "followers" })}
                                className="text-center hover:opacity-70 transition-opacity"
                            >
                                <p className="text-lg font-bold">{profile.followers}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Seguidores</p>
                            </button>
                            <button
                                onClick={() => setFollowList({ open: true, type: "following" })}
                                className="text-center hover:opacity-70 transition-opacity"
                            >
                                <p className="text-lg font-bold">{profile.following}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Siguiendo</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / View Switches */}
            <div className="flex border-t border-border mt-4">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${viewMode === "grid" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                        }`}
                >
                    <Grid className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${viewMode === "list" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                        }`}
                >
                    <List className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-1 pt-1">
                {posts.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <p className="text-muted-foreground text-sm">No has publicado nada todavía</p>
                        <Button
                            variant="link"
                            onClick={() => navigate("/social")}
                            className="text-primary mt-2"
                        >
                            Ir al feed social
                        </Button>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-3 gap-1 animate-fade-in">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="aspect-square bg-secondary/30 relative group cursor-pointer overflow-hidden"
                                onClick={() => setViewMode("list")}
                            >
                                <img
                                    src={post.image_url}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-3 space-y-6 pt-4 animate-fade-in">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onComment={setCommentPostId}
                                onUserClick={(uid) => navigate(`/social/user/${uid}`)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
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
            {/* Follow list sheet */}
            <FollowListSheet
                open={followList.open}
                onOpenChange={(open) => setFollowList((prev) => ({ ...prev, open }))}
                userId={user?.id || ""}
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

export default ProfilePage;
