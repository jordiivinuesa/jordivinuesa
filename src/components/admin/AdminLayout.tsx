import { type ReactNode, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    Share2,
    BarChart3,
    Activity,
    Crown,
    LogOut,
    ArrowLeft,
    Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = ({ children }: { children?: ReactNode }) => {
    const { role, signOut } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Redirect if not admin
    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "Usuarios", path: "/admin/users" },
        { icon: UtensilsCrossed, label: "Alimentos", path: "/admin/foods" },
        { icon: Share2, label: "Plantillas", path: "/admin/templates" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
        { icon: Activity, label: "Sistema", path: "/admin/system" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors mb-4 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Volver a la App</span>
                </Link>
                <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <h1 className="text-lg font-bold font-display">Admin Panel</h1>
                </div>
                <p className="text-xs text-muted-foreground">Panel de control</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }
                `}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar sesión</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden text-card-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold font-display text-lg">Admin Panel</span>
                    </div>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 bg-card">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
