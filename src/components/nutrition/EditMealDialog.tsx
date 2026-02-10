import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import type { MealEntry } from "@/store/useAppStore";
import { foods } from "@/data/foods";

interface EditMealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meal: MealEntry;
    onSaved: (updatedMeal: MealEntry) => void;
}

const EditMealDialog = ({ open, onOpenChange, meal, onSaved }: EditMealDialogProps) => {
    const [grams, setGrams] = useState(String(meal.grams));

    // Find original food data to recalculate macros
    // If not found (e.g. food database changed), we might need to fallback to ratios from the meal entry itself
    const originalFood = foods.find(f => f.id === meal.foodId);

    // Macro ratios per gram
    let caloriesPerGram = 0;
    let proteinPerGram = 0;
    let carbsPerGram = 0;
    let fatPerGram = 0;

    if (originalFood) {
        caloriesPerGram = originalFood.calories / 100;
        proteinPerGram = originalFood.protein / 100;
        carbsPerGram = originalFood.carbs / 100;
        fatPerGram = originalFood.fat / 100;
    } else {
        // Fallback: calculate from current entry
        caloriesPerGram = meal.calories / meal.grams;
        proteinPerGram = meal.protein / meal.grams;
        carbsPerGram = meal.carbs / meal.grams;
        fatPerGram = meal.fat / meal.grams;
    }

    const currentGrams = parseFloat(grams) || 0;
    const currentCalories = Math.round(currentGrams * caloriesPerGram);
    const currentProtein = Math.round(currentGrams * proteinPerGram * 10) / 10;
    const currentCarbs = Math.round(currentGrams * carbsPerGram * 10) / 10;
    const currentFat = Math.round(currentGrams * fatPerGram * 10) / 10;

    useEffect(() => {
        if (open) {
            setGrams(String(meal.grams));
        }
    }, [open, meal]);

    const handleSave = () => {
        if (!currentGrams) return;

        const updatedMeal: MealEntry = {
            ...meal,
            grams: currentGrams,
            calories: currentCalories,
            protein: currentProtein,
            carbs: currentCarbs,
            fat: currentFat,
        };

        onSaved(updatedMeal);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-[380px] rounded-2xl p-4">
                <DialogHeader className="mb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="font-display">Editar Comida</DialogTitle>
                        {/* Close button is handled by DialogPrimitive, but custom one if needed */}
                    </div>
                </DialogHeader>

                <div className="mb-4">
                    <h3 className="font-medium text-lg leading-none mb-1">{meal.foodName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{meal.mealType}</p>
                </div>

                <div className="mb-4">
                    <label className="text-sm text-muted-foreground mb-1 block">Cantidad (gramos)</label>
                    <Input
                        type="number"
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="bg-secondary border-none text-center text-lg font-bold rounded-xl"
                        autoFocus
                    />
                </div>

                {currentGrams > 0 && (
                    <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 p-3">
                        <p className="text-center text-xs text-muted-foreground mb-2">Total para {currentGrams}g</p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div>
                                <p className="text-sm font-bold text-primary">{currentCalories}</p>
                                <p className="text-[10px] text-muted-foreground">kcal</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: "hsl(199, 89%, 48%)" }}>{currentProtein}</p>
                                <p className="text-[10px] text-muted-foreground">prot</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary">{currentCarbs}</p>
                                <p className="text-[10px] text-muted-foreground">carbs</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: "hsl(38, 92%, 50%)" }}>{currentFat}</p>
                                <p className="text-[10px] text-muted-foreground">grasas</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!currentGrams}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditMealDialog;
