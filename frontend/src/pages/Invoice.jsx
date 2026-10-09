import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  MessageCircle,
  Printer,
  XCircle,
  Clock,
  Copy,
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Landmark,
  QrCode,
  User,
  Mail,
  Phone,
  Hash,
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
        `Selamat pagi/siang/sore/malam, Admin.\n\nSaya telah melakukan pembayaran untuk pesanan berikut:\n\nNomor Invoice : ${order.invoice_no}\nUsername      : ${order.username}\n\nMohon dilakukan verifikasi. Bukti transfer terlampir.\n\nTerima kasih.`
      )
    : "";
  const waLink = `https://wa.me/${(settings.whatsapp_owner || "").replace(/\D/g, "")}?text=${waMessage}`;

  const confirmPayment = async () => {
    setConfirming(true);
    try {
      const { data } = await api.post(`/orders/${id}/confirm-payment`);
      setOrder(data);
      toast.success("Status: Menunggu Konfirmasi Admin");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setConfirming(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin");
  };

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-[520px] animate-fade-up rounded-xl" />
      </div>
    );
  }

  const isCompleted = order.status === "Completed";
  const isRejected = order.status === "Payment Rejected";
  const isWaitingAdmin = order.status === "Waiting Admin Confirmation";
  const isWaitingPayment = order.status === "Waiting Payment";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Tombol Kembali */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/history")}
        className="no-print -ml-2 mb-5 h-9 rounded-lg text-[13px] text-muted-foreground transition-all hover:-translate-x-0.5 hover:text-foreground animate-fade-up"
        data-testid="invoice-back-btn"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Kembali ke Riwayat
      </Button>

      {/* Banner Status */}
      {isCompleted && (
        <StatusBanner
          tone="success"
          icon={CheckCircle2}
          title="Pesanan Selesai"
          desc="Terima kasih. Pembayaran Anda telah berhasil diverifikasi dan pesanan telah diproses sepenuhnya."
          testId="purchase-completed"
        />
      )}

      {isRejected && (
        <StatusBanner
          tone="danger"
          icon={XCircle}
          title="Pembayaran Ditolak"
          desc={`Alasan penolakan: ${order.reject_reason || "-"}`}
          testId="payment-rejected"
        />
      )}

      {isWaitingAdmin && (
        <StatusBanner
          tone="info"
          icon={Clock}
          title="Menunggu Konfirmasi Admin"
          desc="Pembayaran Anda sedang dalam proses verifikasi oleh admin. Mohon menunggu."
          testId="waiting-admin"
          compact
        />
      )}

      {/* ---------- Struk Pembelian ---------- */}
      <div className="print-area overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md animate-fade-up [animation-delay:60ms]">
        {/* Kepala Struk */}
        <div className="flex flex-col gap-4 border-b border-border/70 bg-secondary/40 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-heading text-[15px] font-semibold tracking-tight">
                {settings.site_name || "Quick Order"}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Struk Pembelian Resmi
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p
              className="font-heading text-[14px] font-semibold tracking-tight"
              data-testid="invoice-number"
            >
              {order.invoice_no}
            </p>
            <div className="mt-2 flex sm:justify-end">
              <StatusBadge status={order.status} testId="invoice-status" />
            </div>
          </div>
        </div>

        {/* Informasi Pelanggan */}
        <div className="grid gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2">
          <InfoRow icon={User} label="Nama Pengguna" value={order.full_name} />
          <InfoRow icon={Hash} label="Username" value={order.username} />
          <InfoRow icon={Phone} label="Nomor Telepon" value={order.phone} />
          <InfoRow icon={Mail} label="Alamat Email" value={order.email} />
        </div>

        {/* Daftar Produk */}
        <div className="border-t border-border/70 px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2.5 font-medium">Produk</th>
                  <th className="pb-2.5 text-right font-medium">Harga</th>
                  <th className="pb-2.5 text-right font-medium">Diskon</th>
                  <th className="pb-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr
                    key={it.product_id}
                    className="border-t border-border/60 transition-colors hover:bg-secondary/30"
                  >
                    <td className="py-2.5 font-medium">{it.name}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatMoney(it.price, currency)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-primary">
                      -{formatMoney(it.discount, currency)}
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      {formatMoney(it.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ringkasan */}
          <div className="mt-5 flex justify-end">
            <div className="w-full space-y-2 text-[12.5px] sm:w-64">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {formatMoney(order.subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Diskon</span>
                <span className="tabular-nums text-primary">
                  -{formatMoney(order.discount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3">
                <span className="font-heading text-[13.5px] font-semibold">
                  Total Pembayaran
                </span>
                <span
                  className="font-heading text-[15px] font-bold tabular-nums"
                  data-testid="invoice-total"
                >
                  {formatMoney(order.total, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Metode Pembayaran ---------- */}
      {(isWaitingPayment || isRejected) && (
        <div
          className="no-print mt-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md animate-fade-up [animation-delay:120ms]"
          data-testid="payment-methods"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-inset ring-primary/10">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading text-[15px] font-semibold tracking-tight">
                Metode Pembayaran Manual
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Silakan transfer sesuai total pembayaran, kemudian kirimkan bukti transfer melalui WhatsApp.
              </p>
            </div>
          </div>

          {/* DANA + BRI */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PayCard
              icon={Wallet}
              label="DANA"
              holder={settings.dana_name}
              number={settings.dana_number}
              onCopy={() => copy(settings.dana_number)}
            />
            <PayCard
              icon={Landmark}
              label="Bank BRI"
              holder={settings.bri_name}
              number={settings.bri_number}
              onCopy={() => copy(settings.bri_number)}
            />
          </div>

          {/* QRIS */}
          <div className="mt-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/30">
            <div className="flex items-center justify-center gap-1.5 font-heading text-[13px] font-semibold text-primary">
              <QrCode className="h-4 w-4" />
              QRIS (Semua Metode Pembayaran)
            </div>
            {settings.qris_image && (
              <img
                src={mediaUrl(settings.qris_image)}
                alt="QRIS"
                className="mx-auto mt-3 h-44 w-44 rounded-lg border border-border/70 object-cover transition-transform duration-300 hover:scale-105"
                data-testid="qris-image"
              />
            )}
          </div>

          {/* Instruksi */}
          <div className="mt-4 rounded-lg bg-secondary/60 p-4 text-[12.5px] leading-relaxed">
            <strong className="font-semibold">Apabila Anda telah melakukan pembayaran</strong>{" "}
            melalui salah satu metode yang tersedia, mohon kirimkan tangkapan layar (screenshot) bukti transfer kepada kami melalui WhatsApp untuk proses verifikasi.
          </div>

          {/* Tombol Aksi */}
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <a href={waLink} target="_blank" rel="noreferrer" className="flex-1">
              <Button
                size="sm"
                className="h-10 w-full rounded-lg bg-green-600 text-[13.5px] font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md active:translate-y-0"
                data-testid="send-proof-wa-btn"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Kirim Bukti Transfer via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* ---------- Tombol Cetak ---------- */}
      {isCompleted && (
        <div className="no-print mt-5 flex justify-center animate-fade-up [animation-delay:180ms]">
          <Button
            size="sm"
            className="group h-10 rounded-lg px-5 text-[13.5px] font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            onClick={() => window.print()}
            data-testid="print-receipt-btn"
          >
            <Printer className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Cetak / Unduh PDF
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- Banner Status ---------- */
function StatusBanner({ tone, icon: Icon, title, desc, testId, compact = false }) {
  const tones = {
    success:
      "border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10",
    danger:
      "border-red-200/70 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/10",
    info: "border-blue-200/70 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10",
  };
  const iconTones = {
    success:
      "bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
    danger:
      "bg-red-500/15 text-red-600 ring-red-500/20 dark:text-red-400",
    info: "bg-blue-500/15 text-blue-600 ring-blue-500/20 dark:text-blue-400",
  };

  if (compact) {
    return (
      <div
        className={`no-print mb-5 flex items-center gap-3 rounded-xl border p-4 animate-fade-up ${tones[tone]}`}
        data-testid={testId}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${iconTones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-heading text-[13.5px] font-semibold tracking-tight">
            {title}
          </p>
          <p className="text-[12px] text-muted-foreground">{desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`no-print mb-5 flex flex-col items-center rounded-xl border p-6 text-center animate-fade-up ${tones[tone]}`}
      data-testid={testId}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-inset ${iconTones[tone]}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-3 font-heading text-[17px] font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

/* ---------- Baris Informasi ---------- */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/80">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* ---------- Kartu Pembayaran ---------- */
function PayCard({ icon: Icon, label, holder, number, onCopy }) {
  return (
    <div className="group rounded-lg border border-border/70 p-3.5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="font-heading text-[13px] font-semibold text-primary">
          {label}
        </p>
      </div>
      <p className="mt-2.5 text-[11.5px] text-muted-foreground">
        Nama Pemilik: {holder}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium tabular-nums">
          {number}
        </span>
        <button
          onClick={onCopy}
          aria-label={`Salin nomor ${label}`}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
