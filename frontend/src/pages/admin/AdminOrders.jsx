import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrders() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/admin/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  const filtered = (orders || []).filter(
    (o) => o.invoice_no.toLowerCase().includes(q.toLowerCase()) || o.username.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Orders</h1>
      <p className="mt-1 text-muted-foreground">Seluruh transaksi pelanggan.</p>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari invoice / username" className="pl-9" data-testid="admin-orders-search" />
      </div>

      {orders === null ? (
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm" data-testid="admin-orders-table">
            <thead className="bg-secondary/40 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Nomor</th>
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Tidak ada order</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{o.invoice_no}</td>
                    <td className="px-5 py-3">{o.username}</td>
                    <td className="px-5 py-3">{o.phone}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.items.map((i) => i.name).join(", ")}</td>
                    <td className="px-5 py-3 font-medium">{formatMoney(o.total, settings.currency)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
