import { NavLink, useLocation } from "react-router-dom";
import { Dumbbell, UtensilsCrossed, LayoutDashboard, History } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Inicio" },
  { to: "/workout", icon: Dumbbell, label: "Entreno" },
  { to: "/nutrition", icon: UtensilsCrossed, label: "Nutrición" },
  { to: "/history", icon: History, label: "Historial" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-200"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
