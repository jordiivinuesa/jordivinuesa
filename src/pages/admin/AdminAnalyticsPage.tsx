import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Utensils, ClipboardList, Activity, BarChart3, TrendingUp, Calendar, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";

interface AnalyticsStats {
    totalUsers: number;
    totalFoods: number;
    totalWorkouts: number;
    totalTemplates: number;
    totalSocialPosts: number;
    activeUsers7d: number;
    avgWorkoutsPerUser: number;
}

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [
                { count: usersCount },
                { count: foodsCount },
                { count: workoutsCount },
                { count: templatesCount },
                { count: socialCount },
                { data: recentWorkouts }
            ] = await Promise.all([
                supabase.from("profiles").select("*", { count: 'exact', head: true }),
                supabase.from("custom_foods").select("*", { count: 'exact', head: true }),
                supabase.from("workouts").select("*", { count: 'exact', head: true }),
                supabase.from("workout_templates").select("*", { count: 'exact', head: true }),
                supabase.from("social_posts").select("*", { count: 'exact', head: true }),
                supabase.from("workouts").select("user_id").gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            ]);

            // Unique users in last 7 days
            const activeUsers = new Set(recentWorkouts?.map(w => w.user_id)).size;

            setStats({
                totalUsers: usersCount || 0,
                totalFoods: foodsCount || 0,
                totalWorkouts: workoutsCount || 0,
                totalTemplates: templatesCount || 0,
                totalSocialPosts: socialCount || 0,
                activeUsers7d: activeUsers,
                avgWorkoutsPerUser: (usersCount || 0) > 0 ? (workoutsCount || 0) / (usersCount || 1) : 0
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse font-black uppercase tracking-widest">Calculando métricas PEAK...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Analytics
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-primary" /> Rendimiento global de la plataforma
                </p>
            </div>

            {/* Main Metrics Group */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                <MetricCard
                    title="Usuarios Totales"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="h-5 w-5" />}
                    color="primary"
                    description="Registrados en la plataforma"
                />
                <MetricCard
                    title="Entrenamientos"
                    value={stats?.totalWorkouts || 0}
                    icon={<Activity className="h-5 w-5" />}
                    color="blue"
                    description="Sesiones completadas"
                />
                <MetricCard
                    title="Alimentos"
                    value={stats?.totalFoods || 0}
                    icon={<Utensils className="h-5 w-5" />}
                    color="orange"
                    description="Base de datos personalizada"
                />
                <MetricCard
                    title="Feed Social"
                    value={stats?.totalSocialPosts || 0}
                    icon={<Zap className="h-5 w-5" />}
                    color="purple"
                    description="Posts compartidos"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" /> Comportamiento de Usuario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Actividad (7d)</p>
                                <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                                    {stats?.activeUsers7d} <span className="text-xs font-normal text-muted-foreground">usuarios activos</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Ratio de Entreno</p>
                                <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                                    {stats?.avgWorkoutsPerUser.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">por usuario</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Ecosistema</p>
                                <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                                    {stats?.totalTemplates} <span className="text-xs font-normal text-muted-foreground">plantillas guardadas</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BarChart3 className="h-24 w-24" />
                    </div>
                    <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" /> Insights de IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center h-full space-y-6">
                        <div className="text-center space-y-4">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-2xl mx-auto animate-pulse">
                                <Zap className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight text-white">Próxima Actualización</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                                    Estamos procesando modelos de IA para predecir tendencias de salud en la comunidad.
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.2em] text-primary/80 animate-bounce">
                                Coming Soon
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, description, color }: { title: string, value: number, icon: React.ReactNode, description: string, color: string }) => {
    const colorClasses: Record<string, string> = {
        primary: "text-primary bg-primary/10 border-primary/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    };

    return (
        <Card className="border-none bg-secondary/5 backdrop-blur-xl group hover:shadow-2xl transition-all shadow-xl rounded-3xl overflow-hidden active:scale-[0.98]">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 lg:space-y-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">{title}</p>
                    <p className="text-3xl sm:text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors tabular-nums">{value}</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-medium leading-tight line-clamp-2">{description}</p>
            </CardContent>
        </Card>
    );
};

export default AdminAnalyticsPage;
