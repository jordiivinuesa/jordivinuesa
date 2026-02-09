import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useDbSync } from "@/hooks/useDbSync";
import { UserCircle } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  useDbSync();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate("/settings")}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-card text-muted-foreground hover:text-primary transition-colors"
          title="Mi perfil"
        >
          <UserCircle className="h-4 w-4" />
        </button>
      </div>
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
