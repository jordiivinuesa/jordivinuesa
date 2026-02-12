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
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <CardContent className="p-0 sm:p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[180px]">Alimento</TableHead>
                                            <TableHead className="min-w-[150px]">Macros (100g)</TableHead>
                                            <TableHead>Calorías</TableHead>
                                            <TableHead className="hidden md:table-cell">Creador</TableHead>
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
                                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                                                        {food.user_id.substring(0, 8)}...
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {food.created_at ? new Date(food.created_at).toLocaleDateString() : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8">
                                                                    <Trash2 className="h-4 w-4" />
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
                                                                        onClick={() => handleDeleteFood(food.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminFoodsPage;
