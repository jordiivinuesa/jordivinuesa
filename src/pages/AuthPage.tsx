import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dumbbell, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // SECURITY: Password strength validation for signups
    if (!isLogin) {
      if (password.length < 8) {
        toast({
          variant: "destructive",
          title: "Contraseña débil",
          description: "La contraseña debe tener al menos 8 caracteres.",
        });
        setSubmitting(false);
        return;
      }

      if (!/[A-Z]/.test(password)) {
        toast({
          variant: "destructive",
          title: "Contraseña débil",
          description: "La contraseña debe contener al menos una mayúscula.",
        });
        setSubmitting(false);
        return;
      }

      if (!/[0-9]/.test(password)) {
        toast({
          variant: "destructive",
          title: "Contraseña débil",
          description: "La contraseña debe contener al menos un número.",
        });
        setSubmitting(false);
        return;
      }
    }

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else if (!isLogin) {
      toast({
        title: "¡Cuenta creada!",
        description: "Bienvenido a Peak 💪",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 animate-pulse-glow">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Peak</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tu progreso, tu control</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-card p-6 glow-border animate-slide-up">
        <h2 className="mb-6 text-center text-lg font-semibold font-display">
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tu nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-secondary border-none pl-10 rounded-xl h-11"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-none pl-10 rounded-xl h-11"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-none pl-10 rounded-xl h-11"
              required
              minLength={8}
              title="Mínimo 8 caracteres, 1 mayúscula y 1 número"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Registrarse"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
