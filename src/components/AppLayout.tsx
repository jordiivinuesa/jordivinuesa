import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useDbSync } from "@/hooks/useDbSync";
import { useAuth } from "@/hooks/useAuth";
import { UserCircle, Crown } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  useDbSync();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {role === 'admin' && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20 backdrop-blur-sm pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            <Crown className="h-4 w-4" />
            <span>Modo Administrador</span>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
