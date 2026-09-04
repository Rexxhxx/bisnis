import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2, MessageCircle, Printer, Loader2, XCircle, Clock, Copy, ArrowLeft, ShieldCheck,
} from "lucide-react";
import api, { apiError, formatMoney, mediaUrl } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (e) {
      toast.error(apiError(e));
      navigate("/history");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const currency = settings.currency;

  const waMessage = order
    ? encodeURIComponent(
        `Halo Admin.\n\nSaya telah melakukan pembayaran.\n\nInvoice :\n${order.invoice_no}\n\nUsername :\n${order.username}\n\nMohon dicek.\n\nTerima kasih.`
      )
    : "";
  const waLink = `https://wa.me/${(settings.whatsapp_owner || "").replace(/\D/g, "")}?text=${waMessage}`;

  const confirmPayment = async () => {
    setConfirming(true);
    try {
      const { data } = await api.post(`/orders/${id}/confirm-payment`);
      setOrder(data);
      toast.success("Status: Waiting Admin Confirmation");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setConfirming(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin");
  };

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  const isCompleted = order.status === "Completed";
  const isRejected = order.status === "Payment Rejected";
  const isWaitingAdmin = order.status === "Waiting Admin Confirmation";
  const isWaitingPayment = order.status === "Waiting Payment";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button variant="ghost" onClick={() => navigate("/history")} className="no-print mb-4 rounded-full" data-testid="invoice-back-btn">
        <ArrowLeft className="mr-2 h-4 w-4" /> Riwayat
      </Button>

      {isCompleted && (
        <div className="no-print mb-6 flex flex-col items-center rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-500/20 dark:bg-green-500/10 animate-fade-up" data-testid="purchase-completed">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-bold">Purchase Completed</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Thank you. Your payment has been successfully confirmed. Your purchase has been completed.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="no-print mb-6 flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10" data-testid="payment-rejected">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <XCircle className="h-9 w-9" />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-bold">Payment Rejected</h2>
          <p className="mt-2 text-muted-foreground">Alasan: {order.reject_reason || "-"}</p>
        </div>
      )}

      {isWaitingAdmin && (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10" data-testid="waiting-admin">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-heading font-semibold">Waiting Admin Confirmation</p>
            <p className="text-sm text-muted-foreground">Pembayaran Anda sedang diverifikasi oleh admin.</p>
          </div>
        </div>
      )}

      {/* Invoice / Receipt */}
      <div className="print-area overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-heading text-lg font-bold">{settings.site_name || "Quick Order"}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Struk Pembelian</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-lg font-bold" data-testid="invoice-number">{order.invoice_no}</p>
            <div className="mt-1 flex justify-end"><StatusBadge status={order.status} testId="invoice-status" /></div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {[
            ["Nama User", order.full_name],
            ["Username", order.username],
            ["Nomor Pengguna", order.phone],
            ["Email", order.email],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="font-medium">{v}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-3 font-medium">Produk</th>
                <th className="pb-3 text-right font-medium">Harga</th>
                <th className="pb-3 text-right font-medium">Diskon</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.product_id} className="border-t border-border">
                  <td className="py-3 font-medium">{it.name}</td>
                  <td className="py-3 text-right">{formatMoney(it.price, currency)}</td>
                  <td className="py-3 text-right text-primary">-{formatMoney(it.discount, currency)}</td>
                  <td className="py-3 text-right font-semibold">{formatMoney(it.total, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <div className="w-52 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatMoney(order.subtotal, currency)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Diskon</span><span className="text-primary">-{formatMoney(order.discount, currency)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-bold"><span>Total Bayar</span><span data-testid="invoice-total">{formatMoney(order.total, currency)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods (only while unpaid) */}
      {(isWaitingPayment || isRejected) && (
        <div className="no-print mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm" data-testid="payment-methods">
          <h3 className="font-heading text-lg font-bold">Metode Pembayaran Manual</h3>
          <p className="mt-1 text-sm text-muted-foreground">Transfer sesuai total, lalu kirim bukti transfer via WhatsApp.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="font-heading font-semibold text-primary">DANA</p>
              <p className="mt-2 text-sm text-muted-foreground">Nama: {settings.dana_name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-medium">{settings.dana_number}</span>
                <button onClick={() => copy(settings.dana_number)} className="text-muted-foreground hover:text-primary"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="font-heading font-semibold text-primary">Bank BRI</p>
              <p className="mt-2 text-sm text-muted-foreground">Nama: {settings.bri_name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-medium">{settings.bri_number}</span>
                <button onClick={() => copy(settings.bri_number)} className="text-muted-foreground hover:text-primary"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border p-4 text-center">
            <p className="font-heading font-semibold text-primary">QRIS (All Payment)</p>
            {settings.qris_image && (
              <img src={mediaUrl(settings.qris_image)} alt="QRIS" className="mx-auto mt-3 h-48 w-48 rounded-lg border border-border object-cover" data-testid="qris-image" />
            )}
          </div>

          <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed">
            <strong>If you have made a payment</strong> using one of our available payment methods, please take a screenshot of the transfer receipt and send it to us via WhatsApp.
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href={waLink} target="_blank" rel="noreferrer" className="flex-1">
              <Button className="h-11 w-full rounded-full bg-green-600 text-base hover:bg-green-700" data-testid="send-proof-wa-btn">
                <MessageCircle className="mr-2 h-5 w-5" /> Send Bukti TF to Kontak Kami
              </Button>
            </a>
            <Button
              onClick={confirmPayment}
              disabled={confirming}
              variant="outline"
              className="h-11 flex-1 rounded-full border-primary text-base text-primary hover:bg-secondary"
              data-testid="done-send-proof-btn"
            >
              {confirming ? <Loader2 className="h-5 w-5 animate-spin" /> : "Done Send Bukti Transfer"}
            </Button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="no-print mt-6 flex justify-center">
          <Button onClick={() => window.print()} className="rounded-full" data-testid="print-receipt-btn">
            <Printer className="mr-2 h-4 w-4" /> Print / Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}
