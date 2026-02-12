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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface AdminUser {
    user_id: string;
    display_name: string | null;
    email?: string;
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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-white text-[12px]">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Usuarios
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80">
                    Gestión de comunidad PEAK
                </p>
            </div>

            <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Listado ({filteredUsers.length})</CardTitle>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all pointer-events-none" />
                            <Input
                                placeholder="Buscar usuario..."
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
                            <p className="text-xs text-muted-foreground font-medium">Sincronizando perfiles...</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Desktop View - Table (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground tracking-widest">Nombre</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground tracking-widest">ID</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground tracking-widest">Rol</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground tracking-widest text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground border-none">
                                                    No hay resultados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.user_id} className="group border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                                                    <TableCell className="py-4 px-6 font-bold" onClick={(e) => {
                                                        // This onClick is just a dummy to show it's clickable, 
                                                        // normally we'd trigger the dialog here too if we want full row click
                                                    }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10 transition-transform group-hover:scale-110">
                                                                {user.display_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="group-hover:text-primary transition-colors">{user.display_name || "Sin nombre"}</span>
                                                                {user.role === 'admin' && <Shield className="h-3 w-3 text-primary animate-pulse" />}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 font-mono text-[10px] text-muted-foreground/60">{user.user_id}</TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 border-none">
                                                            {user.role}
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

                            {/* Mobile View - Cards (<md) - Ultra Minimal */}
                            <div className="grid grid-cols-1 gap-3 md:hidden p-4">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-white/[0.02] rounded-2xl border border-dashed border-white/10 italic">
                                        Sin resultados
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.user_id}
                                            className={`flex items-center justify-between border rounded-2xl p-4 shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${user.role === 'admin'
                                                    ? 'bg-gradient-to-br from-primary/10 to-transparent border-primary/40 shadow-primary/5'
                                                    : 'bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 hover:border-primary/40'
                                                }`}
                                        >
                                            {user.role === 'admin' && (
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-10 -mt-10" />
                                            )}
                                            <UserDetailsDialog user={user}>
                                                <div className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden relative z-10">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black border shadow-lg shrink-0 ${user.role === 'admin'
                                                            ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary border-primary/30 shadow-primary/20'
                                                            : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary border-primary/20'
                                                        }`}>
                                                        {user.display_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <h3 className="font-bold text-base text-white tracking-tight group-hover:text-primary transition-colors truncate">
                                                            {user.display_name || "Sin nombre"}
                                                        </h3>
                                                        {user.role === 'admin' && <Shield className="h-3 w-3 text-primary shrink-0" />}
                                                    </div>
                                                </div>
                                            </UserDetailsDialog>
                                            <div className="shrink-0 ml-3">
                                                <UserDeleteDialog user={user} onDelete={() => handleDeleteUser(user.user_id)} />
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
                size="icon"
                className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white hover:border-destructive transition-all h-10 w-10 rounded-xl"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90vw] sm:w-[450px] bg-secondary/20 backdrop-blur-3xl border-white/10 rounded-[2.5rem] shadow-2xl p-8 border-none text-white">
            <AlertDialogHeader className="space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto border border-destructive/20 shadow-inner">
                    <Trash2 className="h-8 w-8" />
                </div>
                <AlertDialogTitle className="text-2xl font-black text-center tracking-tight">¿Eliminar perfil?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground/80 leading-relaxed">
                    Estás a punto de eliminar a <span className="text-white font-bold">{user.display_name || 'este usuario'}</span>.
                    Esta acción es irreversible.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
                <AlertDialogCancel className="w-full sm:flex-1 rounded-2xl h-12 bg-white/5 border-white/10 hover:bg-white/10 transition-all font-bold text-white">
                    Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={onDelete}
                    className="w-full sm:flex-1 rounded-2xl h-12 bg-destructive text-white hover:bg-destructive-hover transition-all font-bold shadow-lg shadow-destructive/20"
                >
                    Confirmar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const UserDetailsDialog = ({ user, children }: { user: AdminUser, children: React.ReactNode }) => (
    <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:w-[500px] bg-secondary/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl p-0 overflow-hidden text-white border-none">
            <div className="bg-gradient-to-br from-primary/20 to-transparent p-10 pb-6">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-primary/40 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 shadow-2xl text-4xl">
                        {user.display_name?.[0]?.toUpperCase() || <User className="h-12 w-12" />}
                    </div>
                    <div className="space-y-1.5 overflow-hidden">
                        <DialogTitle className="text-3xl font-black tracking-tight truncate">{user.display_name || "Sin nombre"}</DialogTitle>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-2 px-4 py-1.5 border-none shadow-xl text-xs">
                            {user.role === 'admin' && <Shield className="h-4 w-4" />}
                            <span className="capitalize font-black tracking-widest">{user.role}</span>
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="p-10 pt-4 space-y-8">
                <div className="grid grid-cols-1 gap-5">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-inner">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40">Identificador Único</span>
                        <p className="font-mono text-xs text-primary/70 break-all bg-black/40 p-4 rounded-2xl border border-white/5 leading-relaxed">{user.user_id}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-inner">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Alta
                            </span>
                            <p className="font-bold text-xl">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-inner">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40">Status</span>
                            <Badge
                                variant={user.onboarding_completed ? 'success' : 'outline'}
                                className="w-fit text-[10px] px-3 py-1 border-white/20 font-black uppercase tracking-tighter"
                            >
                                {user.onboarding_completed ? 'Verificado' : 'Espera'}
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-2 flex items-center justify-between shadow-inner">
                        <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40">Privacidad</span>
                            <p className="text-xs font-medium text-white/50 italic flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 opacity-30" /> Email no público
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 text-center border-t border-white/5">
                    <p className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">PEAK CORE ADMIN</p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default AdminUsersPage;
