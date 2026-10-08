import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Home,
  Package,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animation setelah mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto close mobile menu saat route berubah
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all duration-500 ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between max-w-6xl gap-3 px-4 mx-auto h-14 sm:px-6">
        {/* ---------- Brand ---------- */}
        <Link
          to="/dashboard"
          className={`group flex items-center gap-2 shrink-0 transition-all duration-500 ${
            mounted ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
          }`}
          style={{ transitionDelay: "80ms" }}
          data-testid="navbar-brand"
        >
          <span className="flex items-center justify-center w-8 h-8 transition-transform rounded-lg shadow-sm bg-primary text-primary-foreground group-hover:scale-105 group-hover:rotate-3">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-[14.5px] font-semibold tracking-tight truncate max-w-[140px] sm:max-w-none">
            {settings.site_name || "Quick Order"}
          </span>
        </Link>

        {/* ---------- Desktop Nav ---------- */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l, i) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-300 ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1 opacity-0"
                } ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                style={{ transitionDelay: `${140 + i * 60}ms` }}
              >
                <l.icon
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    active ? "" : "group-hover:scale-110"
                  }`}
                />
                <span>{l.label}</span>
                {/* Active indicator */}
                <span
                  className={`absolute -bottom-[7px] left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ${
                    active ? "w-6 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* ---------- Right Actions ---------- */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Cart */}
          <Link
            to="/cart"
            className={`relative transition-all duration-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: "380ms" }}
            data-testid="nav-cart"
          >
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            {cartCount > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9.5px] font-bold text-primary-foreground ring-2 ring-background animate-scale-in"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div
            className={`transition-all duration-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: "440ms" }}
          >
            <NotificationBell />
          </div>

          <div
            className={`transition-all duration-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <ThemeToggle />
          </div>

          {/* Logout (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className={`hidden h-9 w-9 rounded-lg text-muted-foreground transition-all duration-500 hover:bg-destructive/10 hover:text-destructive md:flex ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            style={{ transitionDelay: "560ms" }}
            data-testid="navbar-logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4 transition-transform hover:translate-x-0.5" />
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:bg-secondary/60 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            <span className="relative flex items-center justify-center w-4 h-4">
              <Menu
                className={`absolute h-4 w-4 transition-all duration-300 ${
                  open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                }`}
              />
              <X
                className={`absolute h-4 w-4 transition-all duration-300 ${
                  open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                }`}
              />
            </span>
          </Button>
        </div>
      </div>

      {/* ---------- Mobile Menu ---------- */}
      <div
        className={`overflow-hidden border-border/60 transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          open ? "max-h-[420px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="space-y-0.5 px-3 py-3">
          {links.map((l, i) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                  open
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-2 opacity-0"
                } ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset transition-colors ${
                    active
                      ? "bg-primary/15 text-primary ring-primary/20"
                      : "bg-secondary/60 text-muted-foreground ring-border/60"
                  }`}
                >
                  <l.icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">{l.label}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-scale-in" />
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className={`mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-border/60 px-3 py-2.5 pt-3 text-[13px] font-medium text-destructive transition-all duration-300 hover:bg-destructive/10 ${
              open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
            }`}
            style={{
              transitionDelay: open ? `${80 + links.length * 40}ms` : "0ms",
            }}
          >
            <span className="flex items-center justify-center rounded-md h-7 w-7 bg-destructive/10 ring-1 ring-inset ring-destructive/15">
              <LogOut className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-left">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}