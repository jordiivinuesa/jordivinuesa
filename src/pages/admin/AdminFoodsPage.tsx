import React, { useState, useEffect } from "react";
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
import { Search, Loader2, UtensilsCrossed, User, Barcode, Trash2, Calendar } from "lucide-react";
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

interface CustomFood {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    barcode: string | null;
    user_id: string;
    created_at: string | null;
}

const AdminFoodsPage = () => {
    const [foods, setFoods] = useState<CustomFood[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadFoods();
    }, []);

    const loadFoods = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("custom_foods")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setFoods(data || []);
        } catch (error) {
            console.error("Error loading foods:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFood = async (foodId: string) => {
        try {
            const { error } = await supabase
                .from("custom_foods")
                .delete()
                .eq("id", foodId);

            if (error) throw error;

            setFoods(prev => prev.filter(f => f.id !== foodId));
            toast({
                title: "Alimento eliminado",
                description: "El alimento ha sido eliminado correctamente del catálogo.",
            });
        } catch (error) {
            console.error("Error deleting food:", error);
            toast({
                variant: "destructive",
                title: "Error al eliminar",
                description: "No se pudo eliminar el alimento.",
            });
        }
    };

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.barcode?.includes(searchQuery)
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-white text-[12px]">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Alimentos
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80">
                    Moderación de catálogo comunitario
                </p>
            </div>

            <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Listado ({filteredFoods.length})</CardTitle>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all pointer-events-none" />
                            <Input
                                placeholder="Buscar alimento..."
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
                            <p className="text-xs text-muted-foreground font-medium">Sincronizando catálogo...</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Desktop View - Table (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alimento</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Macros (100g)</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFoods.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-20 text-muted-foreground border-none">
                                                    No hay resultados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredFoods.map((food) => (
                                                <TableRow key={food.id} className="group border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                                                    <TableCell className="py-4 px-6 font-bold">
                                                        <div className="flex flex-col">
                                                            <span className="group-hover:text-primary transition-colors">{food.name}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono opacity-40">{food.id.substring(0, 8)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-400 border-none">P: {food.protein}g</Badge>
                                                            <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-400 border-none">C: {food.carbs}g</Badge>
                                                            <Badge variant="outline" className="text-[10px] bg-orange-500/5 text-orange-400 border-none">G: {food.fat}g</Badge>
                                                            <Badge variant="secondary" className="text-[10px] bg-white/5 border-none">{food.calories} kcal</Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-right">
                                                        <FoodDeleteDialog food={food} onDelete={() => handleDeleteFood(food.id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards (<md) - Ultra Minimal */}
                            <div className="grid grid-cols-1 gap-3 md:hidden p-4">
                                {filteredFoods.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-white/[0.02] rounded-2xl border border-dashed border-white/10 italic">
                                        Sin resultados
                                    </div>
                                ) : (
                                    filteredFoods.map((food) => (
                                        <div
                                            key={food.id}
                                            className="flex items-center justify-between bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-4 shadow-xl hover:border-primary/40 transition-all active:scale-[0.98] group"
                                        >
                                            <FoodDetailsDialog food={food}>
                                                <div className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 shadow-lg shrink-0">
                                                        <UtensilsCrossed className="h-5 w-5" />
                                                    </div>
                                                    <h3 className="font-bold text-base text-white tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {food.name}
                                                    </h3>
                                                </div>
                                            </FoodDetailsDialog>
                                            <div className="shrink-0 ml-3">
                                                <FoodDeleteDialog food={food} onDelete={() => handleDeleteFood(food.id)} />
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

const FoodDeleteDialog = ({ food, onDelete }: { food: CustomFood, onDelete: () => void }) => (
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
                <AlertDialogTitle className="text-2xl font-black text-center tracking-tight">¿Eliminar alimento?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground/80 leading-relaxed">
                    Estás a punto de eliminar <span className="text-white font-bold">{food.name}</span> del catálogo global.
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

const FoodDetailsDialog = ({ food, children }: { food: CustomFood, children: React.ReactNode }) => (
    <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:w-[500px] bg-secondary/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl p-0 overflow-hidden text-white border-none">
            <div className="bg-gradient-to-br from-primary/20 to-transparent p-10 pb-6">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary/40 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 shadow-2xl text-4xl">
                        <UtensilsCrossed className="h-10 w-10" />
                    </div>
                    <div className="space-y-1.5 overflow-hidden">
                        <DialogTitle className="text-2xl font-black tracking-tight leading-tight">{food.name}</DialogTitle>
                        {food.barcode && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
                                <Barcode className="h-3.5 w-3.5" />
                                <span>{food.barcode}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-10 pt-4 space-y-8">
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Kcal', value: food.calories, color: 'text-white' },
                        { label: 'Prot', value: `${food.protein}g`, color: 'text-blue-400' },
                        { label: 'Carb', value: `${food.carbs}g`, color: 'text-green-400' },
                        { label: 'Fat', value: `${food.fat}g`, color: 'text-orange-400' }
                    ].map((macro) => (
                        <div key={macro.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center space-y-1 shadow-inner">
                            <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter opacity-40">{macro.label}</span>
                            <span className={`text-sm font-black ${macro.color}`}>{macro.value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-inner">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40 flex items-center gap-2">
                            <User className="h-3 w-3" /> Creado por
                        </span>
                        <p className="font-mono text-xs text-primary/70 break-all bg-black/40 p-3 rounded-xl border border-white/5">
                            {food.user_id}
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-3 shadow-inner">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] block opacity-40 flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Fecha de Registro
                        </span>
                        <p className="font-bold text-xl">
                            {food.created_at ? new Date(food.created_at).toLocaleDateString() : 'Pendiente'}
                        </p>
                    </div>
                </div>

                <div className="pt-6 text-center border-t border-white/5">
                    <p className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.5em]">PEAK DATABASE MODERATION</p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default AdminFoodsPage;
