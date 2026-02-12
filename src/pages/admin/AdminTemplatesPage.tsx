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
import { Search, Loader2, ClipboardList, User, Trash2, Dumbbell, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";

interface AdminTemplate {
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    created_at: string;
    user_name?: string;
    exercises_count: number;
}

const AdminTemplatesPage = () => {
    const [templates, setTemplates] = useState<AdminTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            // First, get templates and link them with profiles to get user names
            const { data: templatesData, error: tError } = await supabase
                .from("workout_templates")
                .select(`
                    *,
                    profiles (display_name)
                `)
                .order("created_at", { ascending: false });

            if (tError) throw tError;

            // Get exercise counts for each template
            const formattedTemplates = await Promise.all((templatesData || []).map(async (t: any) => {
                const { count } = await supabase
                    .from("template_exercises")
                    .select("*", { count: 'exact', head: true })
                    .eq("template_id", t.id);

                return {
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    user_id: t.user_id,
                    created_at: t.created_at,
                    user_name: t.profiles?.display_name || "Usuario desconocido",
                    exercises_count: count || 0
                };
            }));

            setTemplates(formattedTemplates);
        } catch (error) {
            console.error("Error loading templates:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las plantillas."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            const { error } = await supabase
                .from("workout_templates")
                .delete()
                .eq("id", templateId);

            if (error) throw error;

            setTemplates(prev => prev.filter(t => t.id !== templateId));
            toast({
                title: "Plantilla eliminada",
                description: "La plantilla ha sido eliminada correctamente."
            });
        } catch (error) {
            console.error("Error deleting template:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la plantilla."
            });
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-white text-[12px]">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Plantillas
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80">
                    Moderación de rutinas compartidas
                </p>
            </div>

            <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Listado ({filteredTemplates.length})</CardTitle>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all pointer-events-none" />
                            <Input
                                placeholder="Buscar plantilla o usuario..."
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
                            <p className="text-xs text-muted-foreground font-medium">Sincronizando rutinas...</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plantilla</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Autor</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ejercicios</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTemplates.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground border-none">
                                                    No hay resultados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTemplates.map((template) => (
                                                <TableRow key={template.id} className="group border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                                                    <TableCell className="py-4 px-6 font-bold">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10 transition-transform group-hover:scale-110">
                                                                <ClipboardList className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="group-hover:text-primary transition-colors">{template.name}</span>
                                                                {template.description && (
                                                                    <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[200px]">{template.description}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            <span>{template.user_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <Dumbbell className="h-3 w-3 text-primary/60" />
                                                            <span>{template.exercises_count} ejercicios</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-right flex items-center justify-end gap-2">
                                                        <TemplateDetailsDialog templateId={template.id} templateName={template.name} />
                                                        <TemplateDeleteDialog template={template} onDelete={() => handleDeleteTemplate(template.id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View */}
                            <div className="grid grid-cols-1 gap-3 md:hidden p-4">
                                {filteredTemplates.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-white/[0.02] rounded-2xl border border-dashed border-white/10 italic">
                                        Sin resultados
                                    </div>
                                ) : (
                                    filteredTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center justify-between border border-white/10 rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl transition-all active:scale-[0.98] group"
                                        >
                                            <TemplateDetailsDialog templateId={template.id} templateName={template.name}>
                                                <div className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                        <ClipboardList className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-base text-white truncate group-hover:text-primary transition-colors">
                                                            {template.name}
                                                        </h3>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <User className="h-2.5 w-2.5" /> {template.user_name} • {template.exercises_count} ej.
                                                        </p>
                                                    </div>
                                                </div>
                                            </TemplateDetailsDialog>
                                            <div className="shrink-0 ml-3">
                                                <TemplateDeleteDialog template={template} onDelete={() => handleDeleteTemplate(template.id)} />
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

const TemplateDeleteDialog = ({ template, onDelete }: { template: AdminTemplate, onDelete: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white hover:border-destructive transition-all h-9 w-9 rounded-xl"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90vw] sm:w-[450px] lg:w-[500px] bg-secondary/20 backdrop-blur-3xl border-white/10 rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl p-8 lg:p-12 border-none text-white">
            <AlertDialogHeader className="space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto border border-destructive/20 shadow-inner">
                    <Trash2 className="h-8 w-8" />
                </div>
                <AlertDialogTitle className="text-2xl font-black text-center tracking-tight">¿Eliminar plantilla?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground/80 leading-relaxed">
                    Estás a punto de eliminar <span className="text-white font-bold">{template.name}</span>.
                    Los usuarios que la estén usando perderán su copia local.
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

const TemplateDetailsDialog = ({ templateId, templateName, children }: { templateId: string, templateName: string, children?: React.ReactNode }) => {
    const [details, setDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const { data: exercises, error: eError } = await supabase
                .from("template_exercises")
                .select("*")
                .eq("template_id", templateId)
                .order("order_index");

            if (eError) throw eError;

            const fullDetails = await Promise.all((exercises || []).map(async (ex) => {
                const { data: sets } = await supabase
                    .from("template_sets")
                    .select("*")
                    .eq("template_exercise_id", ex.id)
                    .order("set_index");
                return { ...ex, sets: sets || [] };
            }));

            setDetails(fullDetails);
        } catch (error) {
            console.error("Error loading template details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => open && loadDetails()}>
            <DialogTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-[500px] lg:w-[600px] bg-secondary/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl p-0 overflow-hidden text-white border-none">
                <div className="bg-gradient-to-br from-primary/20 to-transparent p-8 sm:p-10 pb-6 text-center text-balance">
                    <DialogTitle className="text-3xl font-black tracking-tight mb-2">{templateName}</DialogTitle>
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-60 italic">Detalles de la rutina</p>
                </div>

                <div className="p-6 sm:p-10 pt-4 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : details.length === 0 ? (
                        <p className="text-center py-10 text-muted-foreground italic">No hay ejercicios en esta plantilla.</p>
                    ) : (
                        details.map((ex, idx) => (
                            <div key={ex.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <span className="h-5 w-5 rounded-md bg-primary/20 text-primary flex items-center justify-center text-[10px]">{idx + 1}</span>
                                        {ex.exercise_name}
                                    </h4>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground uppercase font-black">{ex.sets.length} series</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {ex.sets.map((set: any, si: number) => (
                                        <div key={set.id} className="text-[11px] flex items-center justify-between text-white/60 font-mono bg-black/20 p-2 rounded-lg border border-white/5">
                                            <span>Serie {si + 1}</span>
                                            <div className="flex items-center gap-3">
                                                <span>{set.reps} reps</span>
                                                <span className="w-px h-2 bg-white/10" />
                                                <span>{set.weight} kg</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 text-center border-t border-white/5">
                    <p className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">PEAK CORE ADMIN</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AdminTemplatesPage;
