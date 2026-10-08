import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Wallet,
  Package,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {});
    api
      .get("/admin/orders")
      .then(({ data }) => setOrders(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const cards = stats
    ? [
        {
          icon: Wallet,
          label: "Total Revenue",
          value: formatMoney(stats.revenue, settings.currency),
          accent: true,
        },
        { icon: ShoppingBag, label: "Total Orders", value: stats.total_orders },
        {
          icon: Clock,
          label: "Pending Confirmation",
          value: stats.pending_confirmations,
          tone: "warning",
        },
        {
          icon: CheckCircle2,
          label: "Completed",
          value: stats.completed,
          tone: "success",
        },
        { icon: Users, label: "Total Users", value: stats.total_users },
        { icon: Package, label: "Products", value: stats.total_products },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Ringkasan aktivitas Quick Order</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Dashboard
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Pantau performa penjualan dan status pesanan terbaru.
        </p>
      </div>

      {/* ---------- Stat Cards ---------- */}
      {!stats ? (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[88px] rounded-xl animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="admin-stats"
        >
          {cards.map((c, i) => (
            <StatCard key={c.label} {...c} delay={60 + i * 50} />
          ))}
        </div>
      )}

      {/* ---------- Recent Orders ---------- */}
      <div className="animate-fade-up [animation-delay:400ms]">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-primary ring-1 ring-inset ring-primary/10">
              <Receipt className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-[15px] font-semibold tracking-tight">
                Order Terbaru
              </h2>
              <p className="text-[12px] text-muted-foreground">
                6 transaksi terakhir
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border shadow-sm rounded-xl border-border/70 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-left bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Invoice</th>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-5 h-5 text-muted-foreground/60" />
                        <span className="text-[12.5px]">Belum ada order</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((o, i) => (
                    <tr
                      key={o.id}
                      className="transition-colors border-t border-border/60 hover:bg-secondary/20 animate-fade-up"
                      style={{ animationDelay: `${460 + i * 40}ms` }}
                    >
                      <td className="px-4 py-2.5 font-medium tabular-nums">
                        {o.invoice_no}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {o.username}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                        {formatMoney(o.total, settings.currency)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({ icon: Icon, label, value, accent = false, tone, delay = 0 }) {
  const tones = {
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/15",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15",
    primary: "bg-primary/10 text-primary ring-primary/15",
  };

  if (accent) {
    return (
      <div
        className="group relative overflow-hidden rounded-xl border border-primary/30 bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* subtle glow */}
        <div className="absolute w-32 h-32 rounded-full pointer-events-none -top-12 -right-12 bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <p className="text-[12px] text-primary-foreground/85">{label}</p>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 ring-1 ring-inset ring-white/20">
            <Icon className="w-4 h-4" />
          </span>
        </div>
        <p className="relative mt-2.5 font-heading text-[20px] font-bold tabular-nums leading-tight">
          {value}
        </p>
        <div className="relative mt-2 flex items-center gap-1 text-[11px] text-primary-foreground/75">
          <TrendingUp className="w-3 h-3" />
          <span>Pendapatan keseluruhan</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-transform group-hover:scale-105 ${
          tones[tone] || tones.primary
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] text-muted-foreground truncate">{label}</p>
        <p className="mt-0.5 font-heading text-[20px] font-bold tabular-nums leading-tight">
          {value}
        </p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
    </div>
  );
}