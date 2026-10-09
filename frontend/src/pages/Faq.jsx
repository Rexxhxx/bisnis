import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  HelpCircle,
  ChevronDown,
  CreditCard,
  Landmark,
  QrCode,
  Clock,
  MessageCircle,
  Package,
  RefreshCw,
  Lock,
  Search,
  X,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ----------------------------------------------------------------
 * Data FAQ — module scope (stabil, tidak memicu warning hooks)
 * ---------------------------------------------------------------- */
const COUNTRIES = ["Japan", "Canada", "Indonesia", "Central African"];

const CATEGORIES = [
  { id: "all", label: "Semua", icon: HelpCircle },
  { id: "produk", label: "Produk", icon: Package },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "aktivasi", label: "Aktivasi", icon: Clock },
  { id: "garansi", label: "Garansi", icon: ShieldCheck },
];

const FAQS = [
  {
    categoryId: "produk",
    category: "Produk",
    icon: Package,
    items: [
      {
        q: "Nomor kosong dari negara mana saja yang tersedia?",
        a: "Saat ini kami menyediakan nomor kosong (virtual number) dari empat negara: Japan, Canada, Indonesia, dan Central African. Stok dapat berubah sewaktu-waktu, silakan cek ketersediaan terbaru sebelum melakukan pembelian.",
      },
      {
        q: "Apa itu nomor kosong dan bagaimana cara kerjanya?",
        a: "Nomor kosong adalah nomor virtual yang belum terdaftar di layanan apa pun. Nomor ini bisa digunakan untuk verifikasi OTP, registrasi akun, atau keperluan lain yang membutuhkan nomor telepon. Setelah pembayaran dikonfirmasi, nomor langsung aktif dan siap menerima SMS masuk.",
      },
      {
        q: "Apakah nomor bisa digunakan untuk semua layanan?",
        a: "Nomor virtual kami dapat digunakan untuk sebagian besar layanan yang membutuhkan verifikasi SMS, seperti WhatsApp, Telegram, TikTok, dan lainnya. Namun, beberapa platform mungkin memblokir nomor virtual. Kami sarankan untuk mengecek kebijakan masing-masing layanan sebelum membeli.",
      },
      {
        q: "Apakah nomor bisa dipakai ulang?",
        a: "Nomor bersifat sekali pakai untuk periode tertentu sesuai paket yang Anda beli. Setelah masa aktif berakhir, nomor tidak dapat digunakan kembali. Silakan lakukan pembelian baru jika membutuhkan nomor tambahan.",
      },
    ],
  },
  {
    categoryId: "pembayaran",
    category: "Pembayaran",
    icon: CreditCard,
    items: [
      {
        q: "Metode pembayaran apa saja yang diterima?",
        a: "Pembayaran dilakukan secara manual melalui tiga metode: Bank BRI (transfer ke rekening BRI yang tertera), DANA (kirim saldo ke nomor tujuan), dan QRIS (scan kode QRIS, mendukung semua e-wallet & mobile banking). Setelah transfer, kirim bukti pembayaran ke admin untuk konfirmasi.",
      },
      {
        q: "Apakah ada biaya tambahan atau tersembunyi?",
        a: "Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final yang perlu Anda bayar. Pastikan nominal transfer sesuai dengan total tagihan agar proses konfirmasi berjalan lancar.",
      },
      {
        q: "Berapa lama konfirmasi pembayaran manual?",
        a: "Konfirmasi pembayaran diverifikasi manual oleh admin dengan rata-rata waktu 5–20 menit pada jam operasional (09.00–22.00 WIB). Jika di luar jam tersebut, konfirmasi akan diproses pada hari berikutnya.",
      },
      {
        q: "Bagaimana cara mengirim bukti pembayaran?",
        a: "Setelah melakukan transfer via BRI, DANA, atau QRIS, kirim screenshot/foto bukti pembayaran ke admin melalui WhatsApp atau Telegram resmi kami. Sertakan juga ID pesanan agar admin dapat memverifikasi dengan cepat.",
      },
    ],
  },
  {
    categoryId: "aktivasi",
    category: "Aktivasi",
    icon: Clock,
    items: [
      {
        q: "Berapa lama proses aktivasi setelah pembayaran?",
        a: "Setelah pembayaran dikonfirmasi oleh admin, nomor virtual langsung diaktifkan. Detail nomor akan dikirim melalui email atau dapat dilihat di dashboard akun Anda. Proses aktivasi umumnya memakan waktu kurang dari 1 menit setelah konfirmasi.",
      },
      {
        q: "Bagaimana cara memesan nomor kosong?",
        a: "Caranya mudah: (1) Pilih negara dan jenis nomor yang diinginkan. (2) Lakukan pembayaran manual via BRI, DANA, atau QRIS. (3) Kirim bukti transfer ke admin (WhatsApp/Telegram). (4) Tunggu konfirmasi, nomor akan dikirim ke email Anda.",
      },
      {
        q: "Di mana saya bisa melihat detail nomor setelah aktif?",
        a: "Detail nomor (nomor telepon, masa aktif, dan status) dapat dilihat di dashboard akun Anda setelah login. Kami juga mengirimkan salinan ke email yang terdaftar saat pembelian.",
      },
    ],
  },
  {
    categoryId: "garansi",
    category: "Garansi & Keamanan",
    icon: ShieldCheck,
    items: [
      {
        q: "Apakah ada garansi jika nomor tidak berfungsi?",
        a: "Tentu. Kami memberikan garansi aktivasi. Jika nomor tidak dapat menerima SMS dalam 1x24 jam setelah aktif, silakan hubungi admin untuk penggantian nomor baru atau refund sesuai kebijakan yang berlaku.",
      },
      {
        q: "Apakah data dan transaksi saya aman?",
        a: "Keamanan data Anda adalah prioritas kami. Semua transaksi diproses secara manual dan terverifikasi oleh admin. Kami tidak menyimpan data sensitif Anda, dan komunikasi dilakukan melalui kanal resmi yang aman.",
      },
    ],
  },
];

export default function Faq() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState("0-0");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((g) => activeCategory === "all" || g.categoryId === activeCategory)
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) => !q || it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, activeCategory]);

  const totalResults = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.items.length, 0),
    [filteredGroups]
  );

  const toggle = (key) => setOpenIndex(openIndex === key ? null : key);

  return (
    /* Wrapper identik dengan Products.jsx */
    <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:py-12">
      {/* Header — struktur sama seperti Products.jsx */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Pusat Bantuan</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Frequently Asked Questions
        </h1>
        <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-muted-foreground">
          Semua jawaban seputar penjualan nomor kosong dari Japan, Canada, Indonesia, dan Central
          African. Pembayaran manual via BRI, DANA, dan QRIS.
        </p>

        {/* Country chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {COUNTRIES.map((c, i) => (
            <button
              key={c}
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground animate-fade-up"
              style={{ animationDelay: `${80 + i * 50}ms` }}
              title={`Lihat nomor ${c}`}
            >
              <Globe className="w-3 h-3 text-primary" />
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-fade-up [animation-delay:60ms]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari pertanyaan... (mis. pembayaran, garansi, BRI)"
          className="w-full h-11 rounded-xl border border-border/70 bg-card pl-10 pr-10 text-[13px] outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 mb-7 animate-fade-up [animation-delay:120ms]">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                active
                  ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                  : "border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Result count — sama seperti Products.jsx */}
      <div className="mb-4 flex items-center justify-between animate-fade-up [animation-delay:180ms]">
        <p className="text-[12.5px] text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground/80">
            {totalResults}
          </span>{" "}
          pertanyaan
          {query && (
            <>
              {" "}
              untuk "<span className="font-medium text-foreground/80">{query}</span>"
            </>
          )}
        </p>
        <div className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground/80">
          <HelpCircle className="w-3 h-3 text-primary" />
          <span>Bantuan cepat & akurat</span>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-8">
        {filteredGroups.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-card p-10 text-center animate-fade-up">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-heading text-[14px] font-semibold">
              Tidak ada hasil ditemukan
            </h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Coba gunakan kata kunci lain atau ubah filter kategori.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-[12px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset filter
            </button>
          </div>
        )}

        {filteredGroups.map((group, gi) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={group.categoryId}
              className="animate-fade-up"
              style={{ animationDelay: `${gi * 60}ms` }}
            >
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
                  <GroupIcon className="w-3.5 h-3.5" />
                </span>
                <h2 className="font-heading text-[14px] font-semibold tracking-tight">
                  {group.category}
                </h2>
                <span className="h-px flex-1 bg-border/70" />
                <span className="text-[11px] text-muted-foreground">
                  {group.items.length} pertanyaan
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  const isOpen = openIndex === key;
                  return (
                    <div
                      key={key}
                      className={`group overflow-hidden rounded-xl border bg-card transition-all duration-300 ${
                        isOpen
                          ? "border-primary/40 shadow-md"
                          : "border-border/70 shadow-sm hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left sm:px-5"
                        aria-expanded={isOpen}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex items-center justify-center w-6 h-6 shrink-0 rounded-md transition-colors ${
                              isOpen
                                ? "bg-primary/15 text-primary"
                                : "bg-secondary text-primary/70 group-hover:bg-primary/10"
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-heading text-[13.5px] font-semibold leading-snug tracking-tight text-foreground">
                            {item.q}
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-border/60 px-4 py-3.5 pl-14 text-[12.5px] leading-relaxed text-muted-foreground sm:px-5 sm:pl-16">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact hint — di dalam wrapper, bukan section terpisah */}
      <div className="relative mt-12 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center animate-fade-up [animation-delay:240ms]">
        <div className="absolute w-48 h-48 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 text-primary mb-3">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="font-heading text-[16px] font-bold tracking-tight">
            Pertanyaan Anda belum terjawab?
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-muted-foreground">
            Hubungi admin kami melalui WhatsApp atau Telegram untuk bantuan lebih lanjut seputar
            nomor kosong dari Japan, Canada, Indonesia, dan Central African.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              className="h-9 rounded-lg px-4 text-[12.5px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => navigate("/contact")}
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Chat Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg px-4 text-[12.5px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
              onClick={() => navigate("/payment-info")}
            >
              <Landmark className="mr-1.5 h-3.5 w-3.5" />
              Info Pembayaran
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Landmark, label: "Bank BRI", path: "/products" },
              { icon: QrCode, label: "QRIS", path: "/products" },
              { icon: Wallet, label: "DANA", path: "/products" },
              { icon: Lock, label: "Aman", path: "/faq" },
            ].map((b) => {
              const BadgeIcon = b.icon;
              return (
                <button
                  key={b.label}
                  onClick={() => navigate(b.path)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                  <BadgeIcon className="h-3 w-3 text-primary" />
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
