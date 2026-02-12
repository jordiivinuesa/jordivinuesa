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
import { Search, Loader2, UtensilsCrossed, User, Barcode, Trash2 } from "lucide-react";
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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-white">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Alimentos
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80">
                    Moderación de base de datos nutricional comunitaria
                </p>
            </div>

            <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Catálogo ({filteredFoods.length})</CardTitle>
                            <p className="text-xs text-muted-foreground">Revisión de aportaciones de usuarios</p>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all pointer-events-none" />
                            <Input
                                placeholder="Nombre o código de barras..."
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
                            <p className="text-xs text-muted-foreground font-medium animate-pulse">Sincronizando catálogo...</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Desktop View - Table (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Información</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Composición (100g)</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Energía</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aportado por</TableHead>
                                            <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFoods.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground border-none">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <UtensilsCrossed className="h-8 w-8 opacity-20" />
                                                        <p className="text-sm">No se han encontrado alimentos</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredFoods.map((food) => (
                                                <TableRow key={food.id} className="group border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{food.name}</span>
                                                            {food.barcode && (
                                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                                    <Barcode className="h-3.5 w-3.5 opacity-50" />
                                                                    <span className="font-mono">{food.barcode}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0">
                                                                P: {food.protein}g
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-green-500/5 text-green-400 border-green-500/20 text-[10px] px-1.5 py-0">
                                                                C: {food.carbs}g
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-orange-500/5 text-orange-400 border-orange-500/20 text-[10px] px-1.5 py-0">
                                                                G: {food.fat}g
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <span className="text-sm font-black text-white">{food.calories} <span className="text-[10px] font-normal opacity-50">kcal</span></span>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-mono text-muted-foreground/60">{food.user_id.substring(0, 12)}...</span>
                                                            <span className="text-[9px] text-muted-foreground/40">{food.created_at ? new Date(food.created_at).toLocaleDateString() : ""}</span>
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

                            {/* Mobile View - Cards (<md) */}
                            <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                                {filteredFoods.length === 0 ? (
                                    <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                        <p className="text-muted-foreground text-sm font-medium">Sin coincidencias</p>
                                    </div>
                                ) : (
                                    filteredFoods.map((food) => (
                                        <div
                                            key={food.id}
                                            className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-5 shadow-xl space-y-5 hover:border-primary/30 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1.5">
                                                    <h3 className="font-bold text-lg text-white tracking-tight leading-tight">{food.name}</h3>
                                                    {food.barcode && (
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/5 w-fit">
                                                            <Barcode className="h-3 w-3 opacity-50" />
                                                            <span>{food.barcode}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="shrink-0 pt-1">
                                                    <FoodDeleteDialog food={food} onDelete={() => handleDeleteFood(food.id)} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-inner">
                                                <div className="flex flex-col items-center justify-center space-y-1">
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-50 text-center leading-none">Kcal</span>
                                                    <span className="text-base font-black text-white">{food.calories}</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center space-y-1 border-l border-white/5">
                                                    <span className="text-[9px] text-blue-400 font-black uppercase tracking-tighter opacity-50 text-center leading-none">Prot</span>
                                                    <span className="text-sm font-black text-white">{food.protein}g</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center space-y-1 border-l border-white/5">
                                                    <span className="text-[9px] text-green-400 font-black uppercase tracking-tighter opacity-50 text-center leading-none">Carb</span>
                                                    <span className="text-sm font-black text-white">{food.carbs}g</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center space-y-1 border-l border-white/5">
                                                    <span className="text-[9px] text-orange-400 font-black uppercase tracking-tighter opacity-50 text-center leading-none">Fat</span>
                                                    <span className="text-sm font-black text-white">{food.fat}g</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-medium leading-none">ID: {food.user_id.substring(0, 8)}...</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground/40 font-bold">
                                                    {food.created_at ? new Date(food.created_at).toLocaleDateString() : "-"}
                                                </span>
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
                <AlertDialogTitle className="text-2xl font-black text-center tracking-tight">¿Eliminar alimento?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
                    Estás a punto de eliminar <span className="text-white font-bold">{food.name}</span> del catálogo global.
                    Esta acción es irreversible.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
                <AlertDialogCancel className="w-full sm:w-1/2 rounded-2xl h-12 bg-white/5 border-white/10 hover:bg-white/10 transition-all font-bold text-white">
                    Cancelar
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

export default AdminFoodsPage;
