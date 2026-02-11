import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Dumbbell, History, Bot, UserCircle, Users, UtensilsCrossed, Heart, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Inicio" },
  { to: "/workout", icon: Dumbbell, label: "Entreno" },
  { to: "/nutrition", icon: UtensilsCrossed, label: "Nutrición" },
  { to: "/social", icon: Users, label: "Social" },
  { to: "/coach", icon: Bot, label: "Coach" },
  { to: "/profile", icon: UserCircle, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const { hasLikes, hasFollows } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/80 px-2 py-3 backdrop-blur-lg animate-slide-up">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
              {item.label === "Perfil" && (hasLikes || hasFollows) && (
                <div className="absolute -top-2 -right-4 flex items-center gap-0.5 animate-pulse bg-card/90 border border-primary/20 rounded-full px-1 py-0.5 shadow-lg backdrop-blur-sm z-10">
                  {hasLikes && <Heart className="h-2.5 w-2.5 fill-primary text-primary" />}
                  {hasFollows && <User className="h-2.5 w-2.5 text-primary fill-primary" />}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
