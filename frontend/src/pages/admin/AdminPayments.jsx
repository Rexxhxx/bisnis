import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  Wallet,
  ClipboardCheck,
  Receipt,
  User,
  Phone,
  Package,
  Hash,
  AlertTriangle,
  BadgeCheck,
  Clock,
} from "lucide-react";
import api, { apiError, formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminPayments() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [reason, setReason] = useState("");

  const load = () =>
    api
      .get("/admin/payments")
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]));

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setBusy(id);
    try {
      await api.post(`/admin/orders/${id}/approve`);
      toast.success("Pembayaran disetujui (Completed)");
      load();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  const doReject = async () => {
    if (!reason.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setBusy(rejectOrder.id);
    try {
      await api.post(`/admin/orders/${rejectOrder.id}/reject`, { reason });
      toast.success("Pembayaran ditolak");
      setRejectOrder(null);
      setReason("");
      load();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <ClipboardCheck className="h-3.5 w-3.5" />
          <span>Verifikasi pembayaran manual dari pelanggan</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Payment Confirmation
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Tinjau bukti transfer dan setujui atau tolak pembayaran.
        </p>
      </div>

      {/* ---------- List ---------- */}
      {orders === null ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-[120px] rounded-xl animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3" data-testid="admin-payments-list">
          {orders.map((o, idx) => (
            <PaymentCard
              key={o.id}
              order={o}
              currency={settings.currency}
              busy={busy === o.id}
              onApprove={() => approve(o.id)}
              onReject={() => {
                setRejectOrder(o);
                setReason("");
              }}
              delay={60 + idx * 60}
            />
          ))}
        </div>
      )}

      {/* ---------- Reject Dialog ---------- */}
      <Dialog open={!!rejectOrder} onOpenChange={(o) => !o && setRejectOrder(null)}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg h-9 w-9 bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div>
                <DialogTitle className="font-heading text-[15px] font-semibold tracking-tight">
                  Tolak Pembayaran
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  Invoice{" "}
                  <span className="font-medium text-foreground/80 tabular-nums">
                    {rejectOrder?.invoice_no}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-1">
            <Label
              htmlFor="reject-reason"
              className="text-[12.5px] font-medium text-foreground/80"
            >
              Alasan Penolakan
            </Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 min-h-[90px] resize-none rounded-lg text-[13px]"
              placeholder="Contoh: Bukti transfer tidak valid / nominal tidak sesuai"
              data-testid="reject-reason-input"
            />
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              Alasan akan ditampilkan ke pelanggan pada halaman invoice.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-[13px]"
              onClick={() => setRejectOrder(null)}
            >
              Batal
            </Button>
            <Button
              onClick={doReject}
              disabled={busy === rejectOrder?.id}
              size="sm"
              className="h-9 rounded-lg bg-destructive text-[13px] font-medium hover:bg-destructive/90"
              data-testid="confirm-reject-btn"
            >
              {busy === rejectOrder?.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Tolak Pembayaran
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Payment Card ---------- */
function PaymentCard({ order: o, currency, busy, onApprove, onReject, delay = 0 }) {
  const canAct = ["Waiting Admin Confirmation", "Waiting Payment"].includes(
    o.status
  );

  const details = [
    { icon: Hash, label: "Invoice", value: o.invoice_no, mono: true },
    { icon: User, label: "Username", value: o.username },
    { icon: Phone, label: "Nomor", value: o.phone || "-", mono: true },
    {
      icon: Package,
      label: "Produk",
      value: o.items?.map((i) => i.name).join(", ") || "-",
    },
  ];

  return (
    <div
      className="p-4 transition-all duration-300 border shadow-sm group rounded-xl border-border/70 bg-card hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      data-testid={`payment-item-${o.invoice_no}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Detail grid */}
        <div className="grid flex-1 gap-x-6 gap-y-3 text-[12.5px] sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-2.5 min-w-0">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60">
                <d.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                  {d.label}
                </p>
                <p
                  className={`mt-0.5 text-[12.5px] font-medium truncate ${
                    d.mono ? "tabular-nums" : ""
                  }`}
                >
                  {d.value}
                </p>
              </div>
            </div>
          ))}

          {/* Nominal & Status */}
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/15">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Nominal
              </p>
              <p className="mt-0.5 text-[13.5px] font-bold tabular-nums">
                {formatMoney(o.total, currency)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60">
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                Status
              </p>
              <div className="mt-1">
                <StatusBadge status={o.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canAct ? (
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              onClick={onApprove}
              disabled={busy}
              size="sm"
              className="h-9 flex-1 rounded-lg bg-emerald-600 text-[13px] font-medium shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 sm:flex-none"
              data-testid={`approve-btn-${o.invoice_no}`}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={onReject}
              variant="outline"
              size="sm"
              className="h-9 flex-1 rounded-lg border-destructive/30 text-[13px] font-medium text-destructive transition-all hover:border-destructive/50 hover:bg-destructive/10 sm:flex-none"
              data-testid={`reject-btn-${o.invoice_no}`}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
            <Clock className="w-3 h-3" />
            Menunggu user kirim bukti
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState() {
  return (
    <div
      className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up"
      data-testid="payments-empty"
    >
      {/* subtle glow */}
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <Wallet className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[16px] font-semibold tracking-tight">
        Tidak ada pembayaran menunggu konfirmasi
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[12.5px] text-muted-foreground">
        Semua pembayaran sudah diverifikasi. Notifikasi baru akan muncul di sini.
      </p>
    </div>
  );
}