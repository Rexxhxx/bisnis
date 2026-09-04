import { useEffect, useState } from "react";
import { Users, ShoppingBag, Clock, CheckCircle2, Wallet, Package } from "lucide-react";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/orders").then(({ data }) => setOrders(data.slice(0, 6))).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { icon: Wallet, label: "Total Revenue", value: formatMoney(stats.revenue, settings.currency), accent: true },
        { icon: ShoppingBag, label: "Total Orders", value: stats.total_orders },
        { icon: Clock, label: "Pending Confirmation", value: stats.pending_confirmations },
        { icon: CheckCircle2, label: "Completed", value: stats.completed },
        { icon: Users, label: "Total Users", value: stats.total_users },
        { icon: Package, label: "Products", value: stats.total_products },
      ]
    : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Ringkasan aktivitas Quick Order.</p>

      {!stats ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="admin-stats">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-2xl border border-border p-6 shadow-sm ${c.accent ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${c.accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.label}</p>
                <c.icon className="h-5 w-5 opacity-70" />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-heading text-xl font-bold">Order Terbaru</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Invoice</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Belum ada order</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{o.invoice_no}</td>
                  <td className="px-5 py-3">{o.username}</td>
                  <td className="px-5 py-3">{formatMoney(o.total, settings.currency)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
