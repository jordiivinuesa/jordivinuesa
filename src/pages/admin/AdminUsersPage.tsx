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
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display mb-2">Usuarios</h1>
                <p className="text-muted-foreground">
                    Gestiona los usuarios registrados en PEAK
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Listado de Usuarios ({filteredUsers.length})</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-secondary border-none"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Desktop View - Table (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Usuario</TableHead>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead className="min-w-[120px]">Registro</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No se encontraron usuarios
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.user_id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                                {user.display_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                                                            </div>
                                                            <span className="font-medium truncate max-w-[150px]">{user.display_name || "Sin nombre"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                        {user.user_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1 text-[10px]">
                                                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.onboarding_completed ? 'success' : 'outline'} className="text-[10px]">
                                                            {user.onboarding_completed ? 'Listo' : 'Pendiente'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <UserDeleteDialog user={user} onDelete={() => handleDeleteUser(user.user_id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards (<md) */}
                            <div className="grid grid-cols-1 gap-4 md:hidden px-4 pb-4">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No se encontraron usuarios</p>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div key={user.user_id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.display_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm">{user.display_name || "Sin nombre"}</h3>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{user.user_id.substring(0, 18)}...</p>
                                                    </div>
                                                </div>
                                                <UserDeleteDialog user={user} onDelete={() => handleDeleteUser(user.user_id)} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-secondary/30 rounded-lg p-2 flex flex-col gap-1">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">Rol</span>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="w-fit gap-1 text-[9px] px-1.5 py-0">
                                                        {user.role === 'admin' && <Shield className="h-2.5 w-2.5" />}
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                <div className="bg-secondary/30 rounded-lg p-2 flex flex-col gap-1">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">Estado</span>
                                                    <Badge variant={user.onboarding_completed ? 'success' : 'outline'} className="w-fit text-[9px] px-1.5 py-0">
                                                        {user.onboarding_completed ? 'Listo' : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-[10px]">Registrado: {new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
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
                className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all gap-1 h-8"
            >
                <Trash2 className="h-4 w-4" />
                <span className="text-[10px] font-bold">Borrar</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[95vw] sm:w-full">
            <AlertDialogHeader>
                <AlertDialogTitle>¿Dar de baja a {user.display_name || 'este usuario'}?</AlertDialogTitle>
                <AlertDialogDescription>
                    Acción permanente. No se puede deshacer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Eliminar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default AdminUsersPage;
