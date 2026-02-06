import { useState } from "react";
import { useAppStore, type MealEntry } from "@/store/useAppStore";
import { foods, foodCategoryLabels, foodCategoryIcons, type FoodCategory, type FoodItem } from "@/data/foods";
import { Plus, Search, UtensilsCrossed, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MacroBar from "@/components/MacroBar";

type MealType = MealEntry["mealType"];

const mealTypeLabels: Record<MealType, string> = {
  desayuno: "🌅 Desayuno",
  almuerzo: "🥪 Almuerzo",
  comida: "🍽️ Comida",
  merienda: "🍪 Merienda",
  cena: "🌙 Cena",
  snack: "🍫 Snack",
};

const NutritionPage = () => {
  const { currentDate, dayLogs, addMealEntry, removeMealEntry, calorieGoal, proteinGoal, carbsGoal, fatGoal } = useAppStore();
  const dayLog = dayLogs[currentDate];
  const meals = dayLog?.meals || [];

  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("comida");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const filteredFoods = foods.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || f.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = Object.entries(foodCategoryLabels) as [FoodCategory, string][];

  const handleAddFood = () => {
    if (!selectedFood) return;
    const multiplier = parseFloat(grams) / 100;
    const entry: MealEntry = {
      id: Math.random().toString(36).substring(2, 9),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      grams: parseFloat(grams),
      calories: selectedFood.calories * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier,
      mealType: selectedMealType,
    };
    addMealEntry(entry);
    setSelectedFood(null);
    setGrams("100");
    setShowFoodPicker(false);
    setSearchQuery("");
  };

  const openFoodPicker = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowFoodPicker(true);
  };

  // Group meals by type
  const mealGroups = (Object.keys(mealTypeLabels) as MealType[]).map((type) => ({
    type,
    label: mealTypeLabels[type],
    meals: meals.filter((m) => m.mealType === type),
  }));

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold font-display animate-fade-in">Nutrición</h1>
      <p className="mb-4 text-sm text-muted-foreground animate-fade-in">Controla tus calorías y macros</p>

      {/* Summary Bar */}
      <div className="mb-4 rounded-2xl bg-card p-4 glow-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold font-display">Hoy</span>
          <span className="text-lg font-bold text-primary">{Math.round(totals.calories)} <span className="text-xs font-normal text-muted-foreground">/ {calorieGoal} kcal</span></span>
        </div>
        <div className="flex gap-3">
          <MacroBar label="Prot" current={totals.protein} goal={proteinGoal} color="hsl(199, 89%, 48%)" />
          <MacroBar label="Carbs" current={totals.carbs} goal={carbsGoal} color="hsl(82, 85%, 50%)" />
          <MacroBar label="Grasas" current={totals.fat} goal={fatGoal} color="hsl(38, 92%, 50%)" />
        </div>
      </div>

      {/* Meal Groups */}
      <div className="space-y-3">
        {mealGroups.map(({ type, label, meals: groupMeals }, idx) => (
          <div
            key={type}
            className="rounded-2xl bg-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold">{label}</span>
              <div className="flex items-center gap-2">
                {groupMeals.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(groupMeals.reduce((s, m) => s + m.calories, 0))} kcal
                  </span>
                )}
                <button
                  onClick={() => openFoodPicker(type)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {groupMeals.length > 0 && (
              <div className="border-t border-border">
                {groupMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{meal.foodName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {meal.grams}g · P:{Math.round(meal.protein)}g · C:{Math.round(meal.carbs)}g · G:{Math.round(meal.fat)}g
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs font-medium text-primary whitespace-nowrap">{Math.round(meal.calories)} kcal</span>
                      <button
                        onClick={() => removeMealEntry(currentDate, meal.id)}
                        className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Food Picker Dialog */}
      <Dialog open={showFoodPicker} onOpenChange={setShowFoodPicker}>
        <DialogContent className="bg-card border-border max-w-[380px] max-h-[85vh] rounded-2xl p-0 overflow-hidden">
          {!selectedFood ? (
            <>
              <div className="p-4 pb-2">
                <DialogHeader>
                  <DialogTitle className="font-display">Añadir alimento</DialogTitle>
                </DialogHeader>
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary border-none pl-9 rounded-xl"
                    autoFocus
                  />
                </div>
                <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {foodCategoryIcons[key]} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto px-4 pb-4 space-y-0.5">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-secondary/70 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{food.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">por 100g</span>
                  </button>
                ))}
                {filteredFoods.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron alimentos</p>
                )}
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setSelectedFood(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
                <DialogTitle className="font-display text-base">{selectedFood.name}</DialogTitle>
                <div className="w-5" />
              </div>

              <div className="mb-4 rounded-xl bg-secondary p-4">
                <p className="text-center text-sm text-muted-foreground mb-1">por 100g</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{selectedFood.calories}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "hsl(199, 89%, 48%)" }}>{selectedFood.protein}</p>
                    <p className="text-[10px] text-muted-foreground">prot</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">{selectedFood.carbs}</p>
                    <p className="text-[10px] text-muted-foreground">carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "hsl(38, 92%, 50%)" }}>{selectedFood.fat}</p>
                    <p className="text-[10px] text-muted-foreground">grasas</p>
                  </div>
                </div>
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

              {parseFloat(grams) > 0 && (
                <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 p-3">
                  <p className="text-center text-xs text-muted-foreground mb-2">Total para {grams}g</p>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {Math.round(selectedFood.calories * parseFloat(grams) / 100)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">kcal</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "hsl(199, 89%, 48%)" }}>
                        {Math.round(selectedFood.protein * parseFloat(grams) / 100 * 10) / 10}
                      </p>
                      <p className="text-[10px] text-muted-foreground">prot</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {Math.round(selectedFood.carbs * parseFloat(grams) / 100 * 10) / 10}
                      </p>
                      <p className="text-[10px] text-muted-foreground">carbs</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "hsl(38, 92%, 50%)" }}>
                        {Math.round(selectedFood.fat * parseFloat(grams) / 100 * 10) / 10}
                      </p>
                      <p className="text-[10px] text-muted-foreground">grasas</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddFood}
                disabled={!parseFloat(grams)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NutritionPage;
