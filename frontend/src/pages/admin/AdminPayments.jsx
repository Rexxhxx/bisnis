import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Wallet } from "lucide-react";
import api, { apiError, formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export default function AdminPayments() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => api.get("/admin/payments").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

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
    if (!reason.trim()) { toast.error("Alasan penolakan wajib diisi"); return; }
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
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Payment Confirmation</h1>
      <p className="mt-1 text-muted-foreground">Verifikasi pembayaran manual dari pelanggan.</p>

      {orders === null ? (
        <div className="mt-8 space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center" data-testid="payments-empty">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-heading font-semibold">Tidak ada pembayaran menunggu konfirmasi</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4" data-testid="admin-payments-list">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm" data-testid={`payment-item-${o.invoice_no}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Invoice: </span><span className="font-semibold">{o.invoice_no}</span></div>
                  <div><span className="text-muted-foreground">Username: </span><span className="font-medium">{o.username}</span></div>
                  <div><span className="text-muted-foreground">Nomor: </span><span className="font-medium">{o.phone}</span></div>
                  <div><span className="text-muted-foreground">Produk: </span><span className="font-medium">{o.items.map((i) => i.name).join(", ")}</span></div>
                  <div><span className="text-muted-foreground">Nominal: </span><span className="font-semibold">{formatMoney(o.total, settings.currency)}</span></div>
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">Status: </span><StatusBadge status={o.status} /></div>
                </div>
                {["Waiting Admin Confirmation", "Waiting Payment"].includes(o.status) ? (
                  <div className="flex gap-2">
                    <Button onClick={() => approve(o.id)} disabled={busy === o.id} className="rounded-full bg-green-600 hover:bg-green-700" data-testid={`approve-btn-${o.invoice_no}`}>
                      {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1.5 h-4 w-4" /> Approve</>}
                    </Button>
                    <Button onClick={() => { setRejectOrder(o); setReason(""); }} variant="outline" className="rounded-full text-destructive hover:bg-destructive/10" data-testid={`reject-btn-${o.invoice_no}`}>
                      <X className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">Menunggu user kirim bukti</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejectOrder} onOpenChange={(o) => !o && setRejectOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Pembayaran — {rejectOrder?.invoice_no}</DialogTitle></DialogHeader>
          <div>
            <Label>Alasan Penolakan</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5" placeholder="Contoh: Bukti transfer tidak valid" data-testid="reject-reason-input" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setRejectOrder(null)}>Batal</Button>
            <Button onClick={doReject} className="rounded-full bg-destructive hover:bg-destructive/90" data-testid="confirm-reject-btn">Tolak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
