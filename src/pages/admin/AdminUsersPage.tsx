import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Loader2, User, Mail, Calendar, Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

interface AdminUser {
    user_id: string;
    display_name: string | null;
    email?: string; // May not be in profiles, but we'll try to get what we can
    role: string;
    created_at: string;
    onboarding_completed: boolean;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers((profiles || []) as unknown as AdminUser[]);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("user_id", userId);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.user_id !== userId));
            toast({
                title: "Usuario eliminado",
                description: "El perfil ha sido eliminado correctamente.",
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                variant: "destructive",
                title: "Error al eliminar",
                description: "No se pudo eliminar el usuario.",
            });
        } finally {
            setDeletingUserId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-white">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Usuarios
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80">
                    Panel de control y gestión de perfiles PEAK
                </p>
            </div>

            <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Listado General</CardTitle>
                            <p className="text-xs text-muted-foreground">{filteredUsers.length} perfiles encontrados</p>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all pointer-events-none" />
                            <Input
                                placeholder="Buscar por nombre o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black/40 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/40 h-12 rounded-2xl transition-all"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground font-medium animate-pulse">Cargando base de datos...</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Desktop View - Table (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usuario</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID Identificador</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privilegios</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alta</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Control</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground border-none">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 opacity-20" />
                                                        <p className="text-sm">No se han encontrado registros coincidentes</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.user_id} className="group border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/10 shadow-lg shrink-0">
                                                                {user.display_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{user.display_name || "Sin nombre"}</span>
                                                                <span className="text-[10px] text-muted-foreground">Miembro activo</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 font-mono text-[10px] text-muted-foreground/60">
                                                        {user.user_id}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1 text-[10px] px-2 py-0.5 border-none shadow-sm capitalize tracking-wide">
                                                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-xs font-medium text-muted-foreground/80">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <Badge variant={user.onboarding_completed ? 'success' : 'outline'} className="text-[10px] px-2 py-0.5 border-white/10 shadow-sm">
                                                            {user.onboarding_completed ? 'Verificado' : 'Pendiente'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-right">
                                                        <UserDeleteDialog user={user} onDelete={() => handleDeleteUser(user.user_id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards (<md) */}
                            <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                        <p className="text-muted-foreground text-sm font-medium">Búsqueda sin resultados</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.user_id}
                                            className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-5 shadow-xl space-y-5 hover:border-primary/30 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 shadow-2xl">
                                                        {user.display_name?.[0]?.toUpperCase() || <User className="h-7 w-7" />}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <h3 className="font-bold text-lg text-white tracking-tight leading-none">{user.display_name || "Sin nombre"}</h3>
                                                        <p className="text-[10px] text-muted-foreground font-mono leading-none flex items-center gap-1 mt-1">
                                                            <Mail className="h-3 w-3 opacity-50" />
                                                            {user.user_id.substring(0, 16)}...
                                                        </p>
                                                    </div>
                                                </div>
                                                <UserDeleteDialog user={user} onDelete={() => handleDeleteUser(user.user_id)} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 space-y-1.5 shadow-inner">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-50">Privilegios</span>
                                                    <Badge
                                                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                        className="w-fit gap-1 text-[10px] px-2.5 py-0.5 border-none shadow-md shadow-primary/5"
                                                    >
                                                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 space-y-1.5 shadow-inner">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-50">Status</span>
                                                    <Badge
                                                        variant={user.onboarding_completed ? 'success' : 'outline'}
                                                        className="w-fit text-[10px] px-2.5 py-0.5 border-white/10 shadow-md"
                                                    >
                                                        {user.onboarding_completed ? 'Listo' : 'Espera'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium italic">Alta: {new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground/40 font-mono font-bold tracking-tighter">REF_{user.user_id.substring(user.user_id.length - 6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const UserDeleteDialog = ({ user, onDelete }: { user: AdminUser, onDelete: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white hover:border-destructive transition-all gap-2 h-9 px-4 rounded-xl font-bold text-xs"
            >
                <Trash2 className="h-4 w-4" />
                <span>Borrar</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[95vw] sm:w-[450px] bg-secondary/20 backdrop-blur-3xl border-white/10 rounded-[2rem] shadow-2xl p-8">
            <AlertDialogHeader className="space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto border border-destructive/20 shadow-inner">
                    <Trash2 className="h-8 w-8" />
                </div>
                <AlertDialogTitle className="text-2xl font-black text-center tracking-tight">¿Eliminar perfil?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
                    Estás a punto de dar de baja a <span className="text-white font-bold">{user.display_name || 'este usuario'}</span>.
                    Esta acción es irreversible y eliminará todos sus datos vinculados.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
                <AlertDialogCancel className="w-full sm:w-1/2 rounded-2xl h-12 bg-white/5 border-white/10 hover:bg-white/10 transition-all font-bold">
                    Mantener
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={onDelete}
                    className="w-full sm:w-1/2 rounded-2xl h-12 bg-destructive text-white hover:bg-destructive/80 transition-all font-bold shadow-lg shadow-destructive/20"
                >
                    Confirmar Borrado
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default AdminUsersPage;
