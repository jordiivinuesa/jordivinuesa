import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useDbSync } from "@/hooks/useDbSync";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Initialize DB sync
  useDbSync();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={signOut}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
