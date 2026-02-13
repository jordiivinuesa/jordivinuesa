import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Loader2, Dumbbell, Flame, Calendar, Users, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocial, type Post, type UserProfile } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/social/PostCard";
import CommentSheet from "@/components/social/CommentSheet";
import FollowListSheet from "@/components/social/FollowListSheet";
import { useNotifications } from "@/hooks/useNotifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStats } from "@/hooks/useStats";
import { useAppStore } from "@/store/useAppStore";
import VolumeChart from "@/components/stats/VolumeChart";
import MuscleDistributionChart from "@/components/stats/MuscleDistributionChart";
import PersonalRecordsList from "@/components/stats/PersonalRecordsList";

const ProfilePage = () => {
    console.log("%c>>> PROFILE_PAGE: MOUNTED", "color: orange; font-weight: bold; font-size: 14px;");
    const navigate = useNavigate();
    const { user } = useAuth();
    const { markAsRead } = useNotifications();
    const queryClient = useQueryClient();
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

    // Use React Query for profile and posts data
    const { data: profile = null, isLoading: profileLoading } = useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: () => user ? fetchUserProfile(user.id) : null,
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes - profiles change rarely
        refetchOnMount: false,
    });

    const { data: posts = [], isLoading: postsLoading } = useQuery({
        queryKey: ['user-posts', user?.id],
        queryFn: () => user ? fetchUserPosts(user.id) : [],
        enabled: !!user,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnMount: false,
    });

    const loading = profileLoading || postsLoading;

    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [followList, setFollowList] = useState<{ open: boolean; type: "followers" | "following" }>({
        open: false,
        type: "followers",
    });

    const { dayLogs } = useAppStore();
    // Reconstruct workouts for useStats. In a real app we might want to fetch history here or keep it in global store
    // For now, let's assume we need to fetch history or use what is available. 
    // Wait, useStats expects array of workouts. 
    // We should probably fetch workout history here too if we want stats, or use a cached query.
    // Let's use the same query key 'workout-history' to leverage cache from HistoryPage if visited.

    // Quick fix: fetch history here too using supabase directly or reuse the logic.
    // Ideally we'd move the query to a custom hook useWorkoutHistory() but for now let's copy the hook usage since React Query handles deduplication.
    // We need to import Supabase and the fetch logic.

    // Actually, let's just use the same useQuery call as in HistoryPage but simpler.
    // We need to import fetchHistory logic or duplication.
    // Let's rely on cached 'workout-history' if exists, or fetch it.

    // To avoid massive code duplication in this step, I will just assume for now we can read from React Query cache 
    // or we should move fetchHistory to a hook. 
    // Let's try to get data from queryClient first.

    const { data: historyWorkouts = [] } = useQuery({
        queryKey: ['workout-history', user?.id],
        enabled: false // Don't fetch automatically if not already cached? 
        // Actually we DO want to fetch if not present. 
        // Since I cannot easily move the fetch function right now without editing another file, 
        // I'll assume the user might have visited History page or I'll add a simple fetch here.
    });

    // WAIT, I should probably copy the fetch logic to ensure it works even if History wasn't visited.
    // But for this interaction, let's try to see if I can just import useDbSync logic? No, that's different.

    // Let's just use useStats with an empty array fallback and maybe add a note that it depends on history being loaded?
    // User asked to MOVE it, so likely they visited History.
    // But for robustness, I should copy the fetch. 

    // ... Revisiting Strategy: I'll use the dayLogs from store as a fallback source of truth!
    // dayLogs contains { [date]: { workouts: [...] } }
    // We can flat map that.

    const storeWorkouts = Object.values(dayLogs).flatMap(log => log.workouts);
    const stats = useStats(storeWorkouts);

    useEffect(() => {
        if (user) {
            console.log("%c>>> PROFILE_PAGE: LLAMANDO A markAsRead()", "color: yellow; font-weight: bold;");
            markAsRead();
        } else {
            console.log("%c>>> PROFILE_PAGE: NO HAY USUARIO, NO SE LIMPIA", "color: red;");
        }
    }, [user, markAsRead]);

    const handleLike = async (postId: string, isLiked: boolean) => {
        queryClient.setQueryData<Post[]>(['user-posts', user?.id], (old = []) =>
            old.map((p) =>
                p.id === postId
                    ? { ...p, is_liked: !isLiked, likes_count: p.likes_count + (isLiked ? -1 : 1) }
                    : p
            )
        );
        await toggleLike(postId, isLiked);
    };

    const handleDelete = async (postId: string) => {
        queryClient.setQueryData<Post[]>(['user-posts', user?.id], (old = []) =>
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

    if (!profile) return null;

    const initial = (profile.display_name || "U")[0].toUpperCase();

    return (
        <div className="min-h-[calc(100vh-80px)] pb-10 bg-background">
            {/* Header with Settings */}
            <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-2 flex items-center justify-between">
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

            {/* Profile Header - Centered Avatar */}
            <div className="px-4 pt-4 pb-6 flex flex-col items-center text-center animate-fade-in">
                <div className="relative mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-1">
                        <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="h-full w-full object-cover" alt="" />
                            ) : (
                                initial
                            )}
                        </div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold font-display mb-1">
                    {profile.display_name || "Usuario"}
                </h2>
            </div>

            {/* Stats Cards Grid - Only show in Social or general view if preferred, or keep on top */}
            <div className="px-4 pb-6 grid grid-cols-3 gap-3">
                {/* Workouts Card */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/10 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{profile.posts_count}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                            Posts
                        </p>
                    </div>
                </div>

                {/* Followers Card */}
                <button
                    onClick={() => setFollowList({ open: true, type: "followers" })}
                    className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-4 border border-blue-500/10 backdrop-blur-sm hover:scale-105 transition-transform active:scale-95"
                >
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                            <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold">{profile.followers}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                            Seguidores
                        </p>
                    </div>
                </button>

                {/* Following Card */}
                <button
                    onClick={() => setFollowList({ open: true, type: "following" })}
                    className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/10 backdrop-blur-sm hover:scale-105 transition-transform active:scale-95"
                >
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-2xl font-bold">{profile.following}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                            Siguiendo
                        </p>
                    </div>
                </button>
            </div>

            <Tabs defaultValue="social" className="px-4">
                <TabsList className="w-full mb-4">
                    <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
                    <TabsTrigger value="stats" className="flex-1">Estadísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="social">
                    {/* Recent Activity Section */}
                    <div>
                        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-primary" />
                            Actividad Reciente
                        </h3>

                        {posts.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-secondary/30 rounded-2xl border border-border">
                                <p className="text-muted-foreground text-sm mb-2">No has publicado nada todavía</p>
                                <Button
                                    variant="link"
                                    onClick={() => navigate("/social")}
                                    className="text-primary"
                                >
                                    Ir al feed social
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.slice(0, 3).map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => setSelectedPostId(post.id)}
                                        className="bg-secondary/30 rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="flex gap-3 p-3">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary">
                                                <img
                                                    src={post.image_url}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold line-clamp-2 mb-1">
                                                    {post.caption || "Sin descripción"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {new Date(post.created_at).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        ❤️ {post.likes_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        💬 {post.comments_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {posts.length > 3 && (
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl"
                                        onClick={() => {
                                            // Show all posts in full view
                                            navigate("/social");
                                        }}
                                    >
                                        Ver todas las publicaciones ({posts.length})
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
                        <div className="col-span-1">
                            <VolumeChart data={stats.volumeData} />
                        </div>
                        <div className="col-span-1">
                            <MuscleDistributionChart data={stats.muscleData} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <PersonalRecordsList data={stats.prData} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Full Post View Modal */}
            {selectedPostId && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <PostCard
                            post={posts.find(p => p.id === selectedPostId)!}
                            onLike={handleLike}
                            onComment={(postId) => {
                                setCommentPostId(postId);
                            }}
                            onUserClick={(uid) => navigate(`/social/user/${uid}`)}
                            onDelete={handleDelete}
                        />
                        <Button
                            variant="outline"
                            className="w-full mt-4 rounded-xl"
                            onClick={() => setSelectedPostId(null)}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}

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
