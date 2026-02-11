import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UtensilsCrossed, Share2, TrendingUp } from "lucide-react";

interface Stats {
    totalUsers: number;
    customFoods: number;
    sharedTemplates: number;
    activeUsers: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        customFoods: 0,
        sharedTemplates: 0,
        activeUsers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [usersRes, foodsRes, templatesRes] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("custom_foods").select("*", { count: "exact", head: true }),
                supabase.from("shared_templates").select("*", { count: "exact", head: true }),
            ]);

            setStats({
                totalUsers: usersRes.count || 0,
                customFoods: foodsRes.count || 0,
                sharedTemplates: templatesRes.count || 0,
                activeUsers: 0, // TODO: Calculate from recent activity
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Usuarios",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Alimentos Personalizados",
            value: stats.customFoods,
            icon: UtensilsCrossed,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Plantillas Compartidas",
            value: stats.sharedTemplates,
            icon: Share2,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Usuarios Activos (7d)",
            value: stats.activeUsers,
            icon: TrendingUp,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                    Resumen general de la aplicación PEAK
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {loading ? "..." : stat.value.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left">
                            <Users className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold mb-1">Gestionar Usuarios</h3>
                            <p className="text-sm text-muted-foreground">
                                Ver y editar perfiles de usuarios
                            </p>
                        </button>
                        <button className="p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left">
                            <UtensilsCrossed className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold mb-1">Moderar Alimentos</h3>
                            <p className="text-sm text-muted-foreground">
                                Revisar alimentos personalizados
                            </p>
                        </button>
                        <button className="p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left">
                            <Share2 className="h-6 w-6 mb-2 text-primary" />
                            <h3 className="font-semibold mb-1">Ver Plantillas</h3>
                            <p className="text-sm text-muted-foreground">
                                Gestionar plantillas compartidas
                            </p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
