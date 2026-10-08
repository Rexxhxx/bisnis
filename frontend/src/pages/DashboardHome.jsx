import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";

const HERO =
  "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function DashboardHome() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => {});
  }, []);

  const completed = orders.filter((o) => o.status === "Completed").length;
  const pending = orders.filter((o) =>
    ["Waiting Payment", "Waiting Admin Confirmation"].includes(o.status)
  ).length;

  const stats = [
    { icon: ShoppingCart, label: "Total Transaksi", value: orders.length, tone: "primary" },
    { icon: ShieldCheck, label: "Selesai", value: completed, tone: "success" },
    { icon: Clock, label: "Menunggu Proses", value: pending, tone: "warning" },
  ];

  const shortcuts = [
    { to: "/products", icon: Package, title: "Products", desc: "Lihat katalog virtual number" },
    { to: "/cart", icon: ShoppingCart, title: "Cart", desc: "Kelola keranjang belanja" },
    { to: "/history", icon: ReceiptText, title: "Purchase History", desc: "Cek status pembelian" },
  ];

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto sm:px-6 lg:py-10">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border rounded-2xl border-border/70 animate-fade-up">
        <img
          src={HERO}
          alt=""
          className="absolute inset-0 object-cover w-full h-full scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-900/80 to-green-900/40" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          {/* brand chip */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
            <Zap className="w-3 h-3" strokeWidth={2.5} />
            {settings.site_name || "Quick Order"}
          </span>

          {/* greeting */}
          <h1 className="mt-4 max-w-xl font-heading text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
            Halo, {user?.full_name || user?.username}
          </h1>
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-white/75">
            {settings.banner ||
              "Beli Virtual Number cepat, aman, dan terpercaya."}
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link to="/products">
              <Button
                size="sm"
                className="group h-9 rounded-lg bg-white text-[13px] font-medium text-green-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md active:translate-y-0"
                data-testid="home-shop-btn"
              >
                Belanja Sekarang
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-white/25 bg-white/5 text-[13px] font-medium text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10"
              >
                Riwayat Pembelian
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <div className="grid gap-4 mt-6 sm:grid-cols-3">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={60 + i * 60} />
        ))}
      </div>

      {/* ---------- Shortcuts ---------- */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-1.5 text-[12.5px] text-muted-foreground animate-fade-up [animation-delay:240ms]">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Akses cepat</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((m, i) => (
            <ShortcutCard key={m.to} {...m} delay={300 + i * 60} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({ icon: Icon, label, value, tone = "primary", delay = 0 }) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/15",
  };

  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-transform group-hover:scale-105 ${tones[tone]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-[11.5px] font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-heading text-[22px] font-bold leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ---------- Shortcut Card ---------- */
function ShortcutCard({ to, icon: Icon, title, desc, delay = 0 }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* hover glow */}
      <div className="absolute w-32 h-32 transition-opacity duration-300 rounded-full opacity-0 pointer-events-none -right-16 -top-16 bg-primary/10 blur-2xl group-hover:opacity-100" />

      <div className="relative flex items-center justify-center transition-colors rounded-lg h-11 w-11 bg-secondary text-primary ring-1 ring-inset ring-primary/10 group-hover:bg-primary/10">
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="relative mt-4 font-heading text-[14.5px] font-semibold tracking-tight">
        {title}
      </h3>
      <p className="relative mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        {desc}
      </p>

      <span className="relative mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary">
        Buka
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}