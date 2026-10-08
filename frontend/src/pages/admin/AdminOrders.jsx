import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Receipt,
  ClipboardList,
  PackageSearch,
  X,
  Filter,
} from "lucide-react";
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
    api
      .get("/admin/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const term = q.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (o) =>
        o.invoice_no?.toLowerCase().includes(term) ||
        o.username?.toLowerCase().includes(term)
    );
  }, [orders, q]);

  const totalCount = orders?.length || 0;
  const resultCount = filtered.length;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Seluruh transaksi pelanggan</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Orders
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Kelola dan pantau seluruh pesanan yang masuk.
        </p>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-up [animation-delay:60ms]">
        <div className="relative w-full max-w-xs group">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari invoice / username"
            className="h-9 pl-9 pr-9 text-[13px] rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
            data-testid="admin-orders-search"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Bersihkan pencarian"
              className="absolute p-1 transition-colors -translate-y-1/2 rounded-md right-2 top-1/2 text-muted-foreground/70 hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {orders !== null && (
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>
              Menampilkan{" "}
              <span className="font-medium text-foreground/80">
                {resultCount}
              </span>{" "}
              dari {totalCount} order
            </span>
          </div>
        )}
      </div>

      {/* ---------- Table ---------- */}
      {orders === null ? (
        <Skeleton className="h-[420px] rounded-xl animate-fade-up [animation-delay:120ms]" />
      ) : filtered.length === 0 ? (
        <EmptyState hasQuery={!!q.trim()} onClear={() => setQ("")} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm animate-fade-up [animation-delay:120ms]">
          <div className="overflow-x-auto">
            <table
              className="w-full text-[12.5px]"
              data-testid="admin-orders-table"
            >
              <thead className="text-left bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Invoice</th>
                  <th className="px-4 py-2.5 font-medium">Username</th>
                  <th className="px-4 py-2.5 font-medium">Nomor</th>
                  <th className="px-4 py-2.5 font-medium">Produk</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className="transition-colors border-t border-border/60 hover:bg-secondary/20 animate-fade-up"
                    style={{ animationDelay: `${160 + i * 25}ms` }}
                  >
                    <td className="px-4 py-2.5 font-medium tabular-nums whitespace-nowrap">
                      {o.invoice_no}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                      {o.username}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                      {o.phone || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="line-clamp-1 max-w-[240px]">
                        {o.items?.map((it) => it.name).join(", ") || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums whitespace-nowrap">
                      {formatMoney(o.total, settings.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ hasQuery, onClear }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card py-14 animate-fade-up"
      data-testid="admin-orders-empty"
    >
      {/* subtle glow */}
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        {hasQuery ? (
          <PackageSearch className="w-5 h-5" />
        ) : (
          <Receipt className="w-5 h-5" />
        )}
      </div>

      <h3 className="relative mt-3.5 font-heading text-[15px] font-semibold tracking-tight">
        {hasQuery ? "Order tidak ditemukan" : "Belum ada order"}
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[12.5px] text-muted-foreground">
        {hasQuery
          ? `Tidak ada hasil untuk pencarian "${""}". Coba kata kunci lain.`
          : "Order akan muncul di sini setelah pelanggan melakukan checkout."}
      </p>

      {hasQuery && (
        <button
          onClick={onClear}
          className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          Bersihkan pencarian
        </button>
      )}
    </div>
  );
}