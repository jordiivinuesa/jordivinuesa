import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/Dashboard";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import HistoryPage from "./pages/HistoryPage";
import ChatPage from "./pages/ChatPage";
import SocialFeedPage from "./pages/SocialFeedPage";
import UserProfilePage from "./pages/UserProfilePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFoodsPage from "./pages/admin/AdminFoodsPage";
import AdminTemplatesPage from "./pages/admin/AdminTemplatesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const [verifyingOnboarding, setVerifyingOnboarding] = useState(true);

  // Load onboarding status directly so we don't depend on useDbSync
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setVerifyingOnboarding(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching onboarding status:", error);
        } else if (data) {
          useAppStore.setState({
            onboardingCompleted: data.onboarding_completed,
          });
        }
      } catch (err) {
        console.error("Uncaught error checkOnboarding:", err);
      } finally {
        setVerifyingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user, loading]);

  if (loading || verifyingOnboarding) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Solo redirigimos si estamos SEGUROS de que es false (confirmado por DB)
  if (onboardingCompleted === false) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute = () => {
  const { user, loading } = useAuth();
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (onboardingCompleted === true) return <Navigate to="/" replace />;
  return <OnboardingPage />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/onboarding" element={<OnboardingRoute />} />

    {/* Admin Routes */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/foods" element={<AdminFoodsPage />} />
              <Route path="/templates" element={<AdminTemplatesPage />} />
              <Route path="/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/system" element={<AdminSystemPage />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      }
    />

    {/* App Routes */}
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/coach" element={<ChatPage />} />
              <Route path="/social" element={<SocialFeedPage />} />
              <Route path="/social/user/:userId" element={<UserProfilePage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
