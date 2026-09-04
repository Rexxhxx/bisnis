import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, Receipt } from "lucide-react";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  const currency = settings.currency;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-bold tracking-tight">Riwayat Pembelian</h1>

      {orders === null ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center" data-testid="history-empty">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="mt-5 font-heading text-xl font-semibold">Belum ada transaksi</h3>
          <p className="mt-2 text-muted-foreground">Transaksi Anda akan muncul di sini.</p>
          <Button onClick={() => navigate("/products")} className="mt-6 rounded-full">Mulai Belanja</Button>
        </div>
      ) : (
        <div className="space-y-4" data-testid="history-list">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
              data-testid={`history-item-${o.invoice_no}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold">{o.invoice_no}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {o.items.map((i) => i.name).join(", ")} · {formatMoney(o.total, currency)}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => navigate(`/invoice/${o.id}`)} data-testid={`history-detail-${o.invoice_no}`}>
                Detail <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
