import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  ArrowRight,
  Receipt,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  Package,
} from "lucide-react";
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
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  const currency = settings.currency;

  return (
    <div className="max-w-4xl px-4 py-10 mx-auto sm:px-6 lg:py-12">
      {/* Header */}
      <div className="mb-7 animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Riwayat aktivitas akun Anda</span>
        </div>
        <h1 className="font-heading text-[28px] font-bold tracking-tight sm:text-[32px]">
          Riwayat Pembelian
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Semua transaksi virtual number Anda tercatat di sini.
        </p>
      </div>

      {orders === null ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-[86px] rounded-xl animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState onShop={() => navigate("/products")} />
      ) : (
        <div className="space-y-2.5" data-testid="history-list">
          {orders.map((o, idx) => (
            <OrderCard
              key={o.id}
              order={o}
              currency={currency}
              index={idx}
              onDetail={() => navigate(`/invoice/${o.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Order Card ---------- */
function OrderCard({ order: o, currency, index, onDetail }) {
  const items = o.items || [];
  const itemNames = items.map((i) => i.name).join(", ");
  const itemCount = items.length;

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 animate-fade-up sm:flex-row sm:items-center sm:justify-between"
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`history-item-${o.invoice_no}`}
    >
      {/* Left */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center justify-center transition-colors rounded-lg h-11 w-11 shrink-0 bg-secondary text-primary ring-1 ring-inset ring-primary/10 group-hover:bg-primary/10">
          <Receipt className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-[14.5px] font-semibold tracking-tight truncate">
              {o.invoice_no}
            </p>
            <StatusBadge status={o.status} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Package className="w-3 h-3" />
              {itemCount} item
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="truncate max-w-[220px] sm:max-w-[320px]">{itemNames}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-medium text-foreground/80">
              {formatMoney(o.total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <Button
        variant="outline"
        size="sm"
        className="group/btn shrink-0 self-stretch rounded-lg sm:self-auto h-9 text-[13px] transition-all hover:border-primary/50 hover:bg-primary/5"
        onClick={onDetail}
        data-testid={`history-detail-${o.invoice_no}`}
      >
        Detail
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
      </Button>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onShop }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up"
      data-testid="history-empty"
    >
      {/* subtle glow */}
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <PackageSearch className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[17px] font-semibold tracking-tight">
        Belum ada transaksi
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[13px] text-muted-foreground">
        Transaksi Anda akan muncul di sini setelah Anda melakukan pembelian pertama.
      </p>

      <Button
        onClick={onShop}
        size="sm"
        className="group relative mt-5 h-9 rounded-lg text-[13px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
        Mulai Belanja
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <div className="relative mt-5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
        <Sparkles className="w-3 h-3" />
        <span>Butuh bantuan? Hubungi support kami</span>
      </div>
    </div>
  );
}