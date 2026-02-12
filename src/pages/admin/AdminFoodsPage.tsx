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
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display mb-2">Alimentos Personalizados</h1>
                <p className="text-muted-foreground">
                    Modera y revisa los alimentos creados por la comunidad
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Listado de Alimentos ({filteredFoods.length})</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o código..."
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
                                            <TableHead className="min-w-[180px]">Alimento</TableHead>
                                            <TableHead className="min-w-[150px]">Macros (100g)</TableHead>
                                            <TableHead>Calorías</TableHead>
                                            <TableHead>Creador</TableHead>
                                            <TableHead className="min-w-[100px]">Fecha</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFoods.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No se encontraron alimentos
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredFoods.map((food) => (
                                                <TableRow key={food.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col min-w-[150px]">
                                                            <span className="font-medium truncate">{food.name}</span>
                                                            {food.barcode && (
                                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                                    <Barcode className="h-3 w-3" />
                                                                    <span>{food.barcode}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 flex-wrap">
                                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 text-[10px] px-1 whitespace-nowrap">
                                                                P: {food.protein}g
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 text-[10px] px-1 whitespace-nowrap">
                                                                C: {food.carbs}g
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20 text-[10px] px-1 whitespace-nowrap">
                                                                G: {food.fat}g
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-sm whitespace-nowrap">
                                                        {food.calories} <span className="text-[10px] font-normal">kcal</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                                        {food.user_id.substring(0, 8)}...
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {food.created_at ? new Date(food.created_at).toLocaleDateString() : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <FoodDeleteDialog food={food} onDelete={() => handleDeleteFood(food.id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards (<md) */}
                            <div className="grid grid-cols-1 gap-4 md:hidden px-4 pb-4">
                                {filteredFoods.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No se encontraron alimentos</p>
                                ) : (
                                    filteredFoods.map((food) => (
                                        <div key={food.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-sm leading-tight">{food.name}</h3>
                                                    {food.barcode && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <Barcode className="h-3 w-3" />
                                                            <span>{food.barcode}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <FoodDeleteDialog food={food} onDelete={() => handleDeleteFood(food.id)} />
                                            </div>

                                            <div className="flex items-center justify-between bg-secondary/20 rounded-lg p-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Calorías</span>
                                                    <span className="text-lg font-black text-primary">{food.calories} <span className="text-xs font-normal">kcal</span></span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] text-blue-500 font-bold">PROT</span>
                                                        <span className="text-xs font-bold">{food.protein}g</span>
                                                    </div>
                                                    <div className="flex flex-col items-center border-x border-border/50 px-2">
                                                        <span className="text-[8px] text-green-500 font-bold">CARB</span>
                                                        <span className="text-xs font-bold">{food.carbs}g</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] text-orange-500 font-bold">FAT</span>
                                                        <span className="text-xs font-bold">{food.fat}g</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>ID: {food.user_id.substring(0, 8)}...</span>
                                                </div>
                                                <span>{food.created_at ? new Date(food.created_at).toLocaleDateString() : "-"}</span>
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
                className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all gap-1 h-8"
            >
                <Trash2 className="h-4 w-4" />
                <span className="text-[10px] font-bold">Borrar</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[95vw] sm:w-full">
            <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar {food.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer.
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

export default AdminFoodsPage;
