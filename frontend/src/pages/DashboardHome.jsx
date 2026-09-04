import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Clock, ArrowRight, Zap, ShieldCheck, Wallet } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";

const HERO = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function DashboardHome() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => {});
  }, []);

  const completed = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-border animate-fade-up">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-900/80 to-green-900/40" />
        <div className="relative px-8 py-16 sm:px-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Zap className="h-3.5 w-3.5" /> {settings.site_name || "Quick Order"}
          </span>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
            Halo, {user?.full_name || user?.username} 👋
          </h1>
          <p className="mt-4 max-w-lg text-white/80">{settings.banner || "Beli Virtual Number cepat, aman, dan terpercaya."}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products">
              <Button className="rounded-full bg-white text-green-800 hover:bg-white/90" data-testid="home-shop-btn">
                Belanja Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                Riwayat Pembelian
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {[
          { icon: ShoppingCart, label: "Total Transaksi", value: orders.length },
          { icon: ShieldCheck, label: "Selesai", value: completed },
          { icon: Clock, label: "Menunggu Proses", value: orders.filter((o) => ["Waiting Payment", "Waiting Admin Confirmation"].includes(o.status)).length },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          { to: "/products", icon: Package, title: "Products", desc: "Lihat katalog virtual number" },
          { to: "/cart", icon: ShoppingCart, title: "Cart", desc: "Kelola keranjang belanja" },
          { to: "/history", icon: Wallet, title: "Purchase History", desc: "Cek status pembelian" },
        ].map((m) => (
          <Link key={m.to} to={m.to} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
            <m.icon className="h-7 w-7 text-primary" />
            <h3 className="mt-4 font-heading text-lg font-bold">{m.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Buka <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
