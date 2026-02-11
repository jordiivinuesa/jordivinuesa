import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";

const FITNESS_GOALS = [
  { value: "perder_peso", label: "Perder peso", icon: "🔥", desc: "Reducir grasa corporal" },
  { value: "ganar_musculo", label: "Ganar masa muscular", icon: "💪", desc: "Hipertrofia y fuerza" },
  { value: "mantenimiento", label: "Mantenimiento", icon: "⚖️", desc: "Mantener peso actual" },
  { value: "recomposicion", label: "Recomposición corporal", icon: "🔄", desc: "Perder grasa y ganar músculo" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentario", label: "Sedentario", desc: "Poco o ningún ejercicio" },
  { value: "moderado", label: "Moderado", desc: "Ejercicio 2-3 veces/semana" },
  { value: "activo", label: "Activo", desc: "Ejercicio 4-5 veces/semana" },
  { value: "muy_activo", label: "Muy activo", desc: "Ejercicio intenso diario" },
];

interface ProfileData {
  display_name: string;
  sex: string;
  age: string;
  fitness_goal: string;
  activity_level: string;
  weight: string;
  height: string;
  calorie_goal: string;
  protein_goal: string;
  carbs_goal: string;
  fat_goal: string;
}

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nameStatus, setNameStatus] = useState<"idle" | "available" | "taken" | "invalid">("idle");

  const [form, setForm] = useState<ProfileData>({
    display_name: "",
    sex: "",
    age: "",
    fitness_goal: "",
    activity_level: "",
    weight: "",
    height: "",
    calorie_goal: "2500",
    protein_goal: "180",
    carbs_goal: "280",
    fat_goal: "80",
  });
  const [original, setOriginal] = useState<ProfileData>(form);

  const update = (field: keyof ProfileData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, sex, age, fitness_goal, activity_level, weight, height, calorie_goal, protein_goal, carbs_goal, fat_goal")
        .eq("user_id", user.id)
        .maybeSingle() as { data: any };
      if (data) {
        const loaded: ProfileData = {
          display_name: data.display_name || "",
          sex: data.sex || "",
          age: data.age?.toString() || "",
          fitness_goal: data.fitness_goal || "",
          activity_level: data.activity_level || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          calorie_goal: data.calorie_goal?.toString() || "2500",
          protein_goal: data.protein_goal?.toString() || "180",
          carbs_goal: data.carbs_goal?.toString() || "280",
          fat_goal: data.fat_goal?.toString() || "80",
        };
        setForm(loaded);
        setOriginal(loaded);
      }
      setLoading(false);
    })();
  }, [user]);

  // Name uniqueness check
  useEffect(() => {
    const trimmed = form.display_name.trim();
    if (!trimmed || trimmed === original.display_name) {
      setNameStatus("idle");
      return;
    }
    if (trimmed.length < 3) {
      setNameStatus("invalid");
      return;
    }
    const timer = setTimeout(async () => {
      if (!user) return;
      setChecking(true);
      const { data } = await supabase.rpc("is_display_name_taken", {
        check_name: trimmed,
        exclude_user_id: user.id,
      });
      setNameStatus(data ? "taken" : "available");
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [form.display_name, original.display_name, user]);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(original);
  const nameOk = form.display_name.trim() === original.display_name || nameStatus === "available";
  const canSave = hasChanges && nameOk && !checking && !saving && form.display_name.trim().length >= 3;

  const handleSave = async () => {
    if (!user || !canSave) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim(),
        sex: form.sex || null,
        age: form.age ? parseInt(form.age) : null,
        fitness_goal: form.fitness_goal || null,
        activity_level: form.activity_level || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        calorie_goal: parseInt(form.calorie_goal) || 2500,
        protein_goal: parseInt(form.protein_goal) || 180,
        carbs_goal: parseInt(form.carbs_goal) || 280,
        fat_goal: parseInt(form.fat_goal) || 80,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
    } else {
      setOriginal({ ...form, display_name: form.display_name.trim() });
      setNameStatus("idle");
      useAppStore.setState({
        calorieGoal: parseInt(form.calorie_goal) || 2500,
        proteinGoal: parseInt(form.protein_goal) || 180,
        carbsGoal: parseInt(form.carbs_goal) || 280,
        fatGoal: parseInt(form.fat_goal) || 80,
      });
      toast({ title: "✅ Perfil actualizado" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 animate-fade-in max-w-lg mx-auto">
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Volver al perfil</span>
      </button>

      <h1 className="text-xl font-bold font-display text-foreground mb-6">Configuración de cuenta</h1>

      <div className="space-y-8">
        {/* Nombre de usuario */}
        <Section title="Nombre de usuario">
          <div className="relative">
            <Input
              value={form.display_name}
              onChange={(e) => update("display_name", e.target.value.slice(0, 50))}
              placeholder="Tu nombre de usuario"
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!checking && nameStatus === "available" && <Check className="h-4 w-4 text-primary" />}
              {!checking && nameStatus === "taken" && <AlertCircle className="h-4 w-4 text-destructive" />}
            </div>
          </div>
          {nameStatus === "taken" && <p className="text-xs text-destructive">Este nombre ya está en uso.</p>}
          {nameStatus === "invalid" && <p className="text-xs text-destructive">Mínimo 3 caracteres.</p>}
          {nameStatus === "available" && !checking && <p className="text-xs text-primary">Nombre disponible.</p>}
        </Section>

        {/* Datos personales */}
        <Section title="Datos personales">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Sexo</Label>
              <RadioGroup value={form.sex} onValueChange={(v) => update("sex", v)} className="grid grid-cols-2 gap-3">
                {[
                  { value: "masculino", label: "Masculino", emoji: "♂️" },
                  { value: "femenino", label: "Femenino", emoji: "♀️" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all ${form.sex === opt.value ? "bg-primary/10 glow-border" : "bg-card hover:bg-card/80"
                      }`}
                  >
                    <RadioGroupItem value={opt.value} />
                    <span>{opt.emoji}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Edad</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="Ej: 25"
                className="bg-card border-none rounded-xl h-10"
                min={14}
                max={100}
              />
            </div>
          </div>
        </Section>

        {/* Objetivo fitness */}
        <Section title="Objetivo fitness">
          <RadioGroup value={form.fitness_goal} onValueChange={(v) => update("fitness_goal", v)} className="space-y-2">
            {FITNESS_GOALS.map((goal) => (
              <label
                key={goal.value}
                className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all ${form.fitness_goal === goal.value ? "bg-primary/10 glow-border" : "bg-card hover:bg-card/80"
                  }`}
              >
                <RadioGroupItem value={goal.value} />
                <span className="text-lg">{goal.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{goal.label}</p>
                  <p className="text-xs text-muted-foreground">{goal.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </Section>

        {/* Nivel de actividad */}
        <Section title="Nivel de actividad">
          <RadioGroup value={form.activity_level} onValueChange={(v) => update("activity_level", v)} className="space-y-2">
            {ACTIVITY_LEVELS.map((level) => (
              <label
                key={level.value}
                className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all ${form.activity_level === level.value ? "bg-primary/10 glow-border" : "bg-card hover:bg-card/80"
                  }`}
              >
                <RadioGroupItem value={level.value} />
                <div>
                  <p className="text-sm font-semibold">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </Section>

        {/* Medidas corporales */}
        <Section title="Medidas corporales">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Peso (kg)</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                placeholder="75"
                className="bg-card border-none rounded-xl h-10 text-center"
                step="0.1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
                placeholder="175"
                className="bg-card border-none rounded-xl h-10 text-center"
              />
            </div>
          </div>
        </Section>

        {/* Objetivos nutricionales */}
        <Section title="Objetivos nutricionales">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Calorías (kcal/día)</Label>
              <Input
                type="number"
                value={form.calorie_goal}
                onChange={(e) => update("calorie_goal", e.target.value)}
                className="bg-card border-none rounded-xl h-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Proteína (g)</Label>
                <Input
                  type="number"
                  value={form.protein_goal}
                  onChange={(e) => update("protein_goal", e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Carbos (g)</Label>
                <Input
                  type="number"
                  value={form.carbs_goal}
                  onChange={(e) => update("carbs_goal", e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Grasa (g)</Label>
                <Input
                  type="number"
                  value={form.fat_goal}
                  onChange={(e) => update("fat_goal", e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Guardar */}
        <Button onClick={handleSave} disabled={!canSave} className="w-full rounded-xl h-12">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Guardar cambios
        </Button>

        {/* Cerrar sesión */}
        <div className="pt-4 border-t border-border">
          <Button variant="outline" onClick={signOut} className="w-full rounded-xl text-destructive hover:text-destructive">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    {children}
  </div>
);

export default SettingsPage;
