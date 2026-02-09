import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Target,
  Activity,
  Ruler,
  Weight,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  User,
  Flame,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("2500");
  const [proteinGoal, setProteinGoal] = useState("180");
  const [carbsGoal, setCarbsGoal] = useState("280");
  const [fatGoal, setFatGoal] = useState("80");

  const steps = [
    { title: "Sobre ti", icon: User },
    { title: "Tu objetivo", icon: Target },
    { title: "Tu cuerpo", icon: Ruler },
    { title: "Objetivos nutricionales", icon: Flame },
  ];

  const canAdvance = () => {
    switch (step) {
      case 0:
        return sex !== "" && age !== "";
      case 1:
        return fitnessGoal !== "" && activityLevel !== "";
      case 2:
        return true; // weight/height optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        sex,
        age: age ? parseInt(age) : null,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        calorie_goal: parseInt(calorieGoal) || 2500,
        protein_goal: parseInt(proteinGoal) || 180,
        carbs_goal: parseInt(carbsGoal) || 280,
        fat_goal: parseInt(fatGoal) || 80,
        onboarding_completed: true,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setSubmitting(false);
      return;
    }

    useAppStore.setState({
      onboardingCompleted: true,
      calorieGoal: parseInt(calorieGoal) || 2500,
      proteinGoal: parseInt(proteinGoal) || 180,
      carbsGoal: parseInt(carbsGoal) || 280,
      fatGoal: parseInt(fatGoal) || 80,
    });

    toast({ title: "¡Perfil completado!", description: "Bienvenido a FitTracker 💪" });
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Paso {step + 1} de {steps.length}
        </p>
      </div>

      {/* Step header */}
      <div className="px-6 pt-4 pb-6 animate-fade-in" key={step}>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          {(() => {
            const StepIcon = steps[step].icon;
            return <StepIcon className="h-6 w-6 text-primary" />;
          })()}
        </div>
        <h1 className="text-2xl font-bold font-display">{steps[step].title}</h1>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 animate-slide-up" key={`content-${step}`}>
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Sexo</Label>
              <RadioGroup value={sex} onValueChange={setSex} className="grid grid-cols-2 gap-3">
                {[
                  { value: "masculino", label: "Masculino", emoji: "♂️" },
                  { value: "femenino", label: "Femenino", emoji: "♀️" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 rounded-2xl p-4 cursor-pointer transition-all ${
                      sex === option.value
                        ? "bg-primary/10 glow-border"
                        : "bg-card hover:bg-card/80"
                    }`}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-medium mb-2 block">
                Edad
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Ej: 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-card border-none rounded-xl h-12 text-lg"
                min={14}
                max={100}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">¿Cuál es tu objetivo?</Label>
              <RadioGroup value={fitnessGoal} onValueChange={setFitnessGoal} className="space-y-3">
                {FITNESS_GOALS.map((goal) => (
                  <label
                    key={goal.value}
                    className={`flex items-center gap-3 rounded-2xl p-4 cursor-pointer transition-all ${
                      fitnessGoal === goal.value
                        ? "bg-primary/10 glow-border"
                        : "bg-card hover:bg-card/80"
                    }`}
                  >
                    <RadioGroupItem value={goal.value} />
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{goal.label}</p>
                      <p className="text-xs text-muted-foreground">{goal.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Nivel de actividad</Label>
              <RadioGroup value={activityLevel} onValueChange={setActivityLevel} className="space-y-3">
                {ACTIVITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-3 rounded-2xl p-4 cursor-pointer transition-all ${
                      activityLevel === level.value
                        ? "bg-primary/10 glow-border"
                        : "bg-card hover:bg-card/80"
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
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium mb-2 block">
                Peso (kg) — opcional
              </Label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ej: 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-card border-none rounded-xl h-12 text-lg pl-11"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="height" className="text-sm font-medium mb-2 block">
                Altura (cm) — opcional
              </Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="height"
                  type="number"
                  placeholder="Ej: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-card border-none rounded-xl h-12 text-lg pl-11"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Puedes ajustar estos valores luego desde tu perfil
            </p>
            <div>
              <Label htmlFor="calorieGoal" className="text-sm font-medium mb-2 block">
                Objetivo calórico (kcal/día)
              </Label>
              <Input
                id="calorieGoal"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="bg-card border-none rounded-xl h-12 text-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="proteinGoal" className="text-xs text-muted-foreground mb-1 block">
                  Proteína (g)
                </Label>
                <Input
                  id="proteinGoal"
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
              <div>
                <Label htmlFor="carbsGoal" className="text-xs text-muted-foreground mb-1 block">
                  Carbos (g)
                </Label>
                <Input
                  id="carbsGoal"
                  type="number"
                  value={carbsGoal}
                  onChange={(e) => setCarbsGoal(e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
              <div>
                <Label htmlFor="fatGoal" className="text-xs text-muted-foreground mb-1 block">
                  Grasa (g)
                </Label>
                <Input
                  id="fatGoal"
                  type="number"
                  value={fatGoal}
                  onChange={(e) => setFatGoal(e.target.value)}
                  className="bg-card border-none rounded-xl h-10 text-sm text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-6 py-6 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="h-12 rounded-2xl px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        )}

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={submitting}
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Empezar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
