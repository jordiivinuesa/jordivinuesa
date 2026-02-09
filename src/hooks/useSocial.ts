import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  is_public: boolean;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  followers: number;
  following: number;
  is_following: boolean;
  posts_count: number;
}

function enrichPosts(
  posts: any[],
  profileMap: Map<string, any>,
  likeCounts: Map<string, number>,
  commentCounts: Map<string, number>,
  userLikes: Set<string>
): Post[] {
  return posts.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    image_url: p.image_url,
    caption: p.caption,
    is_public: p.is_public,
    created_at: p.created_at,
    profile: profileMap.get(p.user_id),
    likes_count: likeCounts.get(p.id) || 0,
    comments_count: commentCounts.get(p.id) || 0,
    is_liked: userLikes.has(p.id),
  }));
}

export function useSocial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) return null;
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (error) {
        toast({ variant: "destructive", title: "Error al subir imagen", description: error.message });
        return null;
      }

      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(data.path);
      return urlData.publicUrl;
    },
    [user]
  );

  const createPost = useCallback(
    async (file: File, caption: string, isPublic: boolean) => {
      if (!user) return null;
      setLoading(true);
      try {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) return null;

        const { data, error } = await supabase
          .from("posts")
          .insert({ user_id: user.id, image_url: imageUrl, caption, is_public: isPublic })
          .select()
          .single();

        if (error) throw error;
        toast({ title: "📸 Publicación creada" });
        return data;
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, uploadImage]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) return;
      await supabase.from("posts").delete().eq("id", postId);
    },
    [user]
  );

  const fetchPostMeta = useCallback(
    async (postIds: string[]) => {
      if (!user || postIds.length === 0) return { likeCounts: new Map(), commentCounts: new Map(), userLikes: new Set<string>() };

      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds),
        supabase.from("post_comments").select("post_id").in("post_id", postIds),
      ]);

      const likeCounts = new Map<string, number>();
      const userLikes = new Set<string>();
      likes?.forEach((l) => {
        likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1);
        if (l.user_id === user.id) userLikes.add(l.post_id);
      });

      const commentCounts = new Map<string, number>();
      comments?.forEach((c) => {
        commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1);
      });

      return { likeCounts, commentCounts, userLikes };
    },
    [user]
  );

  const fetchFeed = useCallback(async (): Promise<Post[]> => {
    if (!user) return [];

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!posts || posts.length === 0) return [];

    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
    const { likeCounts, commentCounts, userLikes } = await fetchPostMeta(posts.map((p) => p.id));

    return enrichPosts(posts, profileMap, likeCounts, commentCounts, userLikes);
  }, [user, fetchPostMeta]);

  const fetchUserPosts = useCallback(
    async (userId: string): Promise<Post[]> => {
      if (!user) return [];

      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!posts || posts.length === 0) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("user_id", userId)
        .single();

      const profileMap = new Map(profile ? [[profile.user_id, profile]] : []);
      const { likeCounts, commentCounts, userLikes } = await fetchPostMeta(posts.map((p) => p.id));

      return enrichPosts(posts, profileMap, likeCounts, commentCounts, userLikes);
    },
    [user, fetchPostMeta]
  );

  const toggleLike = useCallback(
    async (postId: string, isLiked: boolean) => {
      if (!user) return;
      if (isLiked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId });
      }
    },
    [user]
  );

  const fetchComments = useCallback(
    async (postId: string): Promise<PostComment[]> => {
      if (!user) return [];

      const { data: comments } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (!comments || comments.length === 0) return [];

      const userIds = [...new Set(comments.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return comments.map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id),
      }));
    },
    [user]
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("post_comments")
        .insert({ user_id: user.id, post_id: postId, content })
        .select()
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        return null;
      }
      return data;
    },
    [user]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!user) return;
      await supabase.from("post_comments").delete().eq("id", commentId);
    },
    [user]
  );

  const followUser = useCallback(
    async (followingId: string) => {
      if (!user) return;
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: followingId });
      if (!error) toast({ title: "👥 Siguiendo usuario" });
    },
    [user]
  );

  const unfollowUser = useCallback(
    async (followingId: string) => {
      if (!user) return;
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", followingId);
    },
    [user]
  );

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      if (!user) return null;

      const [{ data: profile }, { count: followers }, { count: following }, { count: postsCount }, { data: followRow }] =
        await Promise.all([
          supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", userId).single(),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle(),
        ]);

      if (!profile) return null;

      return {
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        followers: followers || 0,
        following: following || 0,
        is_following: !!followRow,
        posts_count: postsCount || 0,
      };
    },
    [user]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!user || !query.trim()) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .ilike("display_name", `%${query}%`)
        .neq("user_id", user.id)
        .limit(20);
      return data || [];
    },
    [user]
  );

  return {
    loading,
    createPost,
    deletePost,
    fetchFeed,
    fetchUserPosts,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
    followUser,
    unfollowUser,
    fetchUserProfile,
    searchUsers,
  };
}
