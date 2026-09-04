import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Home, Package, Clock, User, LogOut, Menu, X, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/products", label: "Products", icon: Package },
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2" data-testid="navbar-brand">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold">{settings.site_name || "Quick Order"}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative" data-testid="nav-cart">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {cartCount}
              </span>
            )}
          </Link>
          <NotificationBell />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hidden md:flex"
            data-testid="navbar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
