import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nameStatus, setNameStatus] = useState<"idle" | "available" | "taken" | "invalid">("idle");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.display_name) {
        setDisplayName(data.display_name);
        setOriginalName(data.display_name);
      }
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === originalName) {
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
  }, [displayName, originalName, user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 50) return;
    if (nameStatus === "taken") return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el nombre.", variant: "destructive" });
    } else {
      setOriginalName(trimmed);
      setNameStatus("idle");
      toast({ title: "Guardado", description: "Nombre de usuario actualizado." });
    }
    setSaving(false);
  };

  const hasChanges = displayName.trim() !== originalName;
  const canSave = hasChanges && nameStatus === "available" && !checking && !saving;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Volver</span>
      </button>

      <h1 className="text-xl font-bold font-display text-foreground mb-6">Mi perfil</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre de usuario</Label>
          <div className="relative">
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
              placeholder="Tu nombre de usuario"
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!checking && nameStatus === "available" && (
                <Check className="h-4 w-4 text-primary" />
              )}
              {!checking && nameStatus === "taken" && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
          {nameStatus === "taken" && (
            <p className="text-xs text-destructive">Este nombre ya está en uso.</p>
          )}
          {nameStatus === "invalid" && (
            <p className="text-xs text-destructive">Mínimo 3 caracteres.</p>
          )}
          {nameStatus === "available" && !checking && (
            <p className="text-xs text-primary">Nombre disponible.</p>
          )}
        </div>

        <Button onClick={handleSave} disabled={!canSave} className="w-full rounded-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Guardar cambios
        </Button>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Button variant="outline" onClick={signOut} className="w-full rounded-xl text-destructive hover:text-destructive">
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
