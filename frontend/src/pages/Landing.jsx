import { Link } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Globe,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const HERO =
  "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const { settings } = useSettings();

  const features = [
    {
      icon: Zap,
      title: "Aktivasi Instan",
      desc: "Nomor virtual langsung aktif setelah pembayaran dikonfirmasi.",
    },
    {
      icon: ShieldCheck,
      title: "Aman & Terpercaya",
      desc: "Konfirmasi pembayaran diverifikasi manual oleh admin.",
    },
    {
      icon: Wallet,
      title: "Bayar Fleksibel",
      desc: "Mendukung DANA, Bank BRI, dan QRIS all payment.",
    },
  ];

  const countries = ["Japan", "Canada", "Indonesia"];

  return (
    <div className="min-h-screen bg-background">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-6xl px-4 mx-auto h-14 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex items-center justify-center w-8 h-8 transition-transform rounded-lg shadow-sm bg-primary text-primary-foreground group-hover:scale-105">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              {settings.site_name || "Quick Order"}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-[13px] font-medium"
                data-testid="landing-login-btn"
              >
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="h-8 rounded-lg text-[13px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                data-testid="landing-register-btn"
              >
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        {/* background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full -top-32 -left-32 h-96 w-96 bg-primary/10 blur-3xl" />
          <div className="absolute rounded-full top-1/3 -right-32 h-96 w-96 bg-primary/5 blur-3xl" />
        </div>

        <div className="relative grid items-center max-w-6xl gap-10 px-4 mx-auto py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
          {/* Left copy */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11.5px] font-medium text-primary">
              <Sparkles className="w-3 h-3" />
              Virtual Number Store
            </span>

            <h1 className="mt-4 font-heading text-[32px] font-bold leading-[1.15] tracking-tight sm:text-[40px] lg:text-[46px]">
              Beli Virtual Number{" "}
              <span className="relative inline-block text-primary">
                Cepat & Aman
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-primary/30" />
              </span>
            </h1>

            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
              {settings.banner ||
                "Japan, Canada & Indonesia number siap pakai. Pembayaran manual mudah via DANA, BRI, dan QRIS."}
            </p>

            {/* Country chips */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {countries.map((c, i) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground animate-fade-up"
                  style={{ animationDelay: `${120 + i * 60}ms` }}
                >
                  <Globe className="w-3 h-3 text-primary" />
                  {c}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link to="/register">
                <Button
                  size="sm"
                  className="group h-10 rounded-lg px-5 text-[13.5px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-lg px-5 text-[13.5px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  Sudah punya akun
                </Button>
              </Link>
            </div>

            {/* Trust hint */}
            <div className="mt-6 flex items-center gap-4 text-[11.5px] text-muted-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Tanpa biaya tersembunyi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary" />
                Dipercaya pelanggan
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            {/* Glow frame */}
            <div className="absolute -inset-3 rounded-[26px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />

            <div className="relative overflow-hidden border shadow-xl rounded-2xl border-border/70 bg-card">
              <img
                src={HERO}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              {/* overlay chip */}
              <div className="absolute flex items-center justify-between px-3 py-2 border bottom-3 left-3 right-3 rounded-xl border-white/15 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center text-white rounded-md h-7 w-7 bg-white/15">
                    <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[11px] font-semibold text-white">
                      Aktivasi Instan
                    </p>
                    <p className="text-[10px] text-white/70">
                      Nomor siap dalam hitungan detik
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="max-w-6xl px-4 pb-16 mx-auto sm:px-6 lg:pb-20">
        <div className="text-center mb-7 animate-fade-up">
          <h2 className="font-heading text-[22px] font-bold tracking-tight sm:text-[26px]">
            Kenapa pilih Quick Order?
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Pengalaman pembelian virtual number yang simpel dan terpercaya.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
              style={{ animationDelay: `${180 + i * 80}ms` }}
            >
              {/* hover glow */}
              <div className="absolute w-32 h-32 transition-opacity duration-300 rounded-full opacity-0 pointer-events-none -top-16 -right-16 bg-primary/10 blur-2xl group-hover:opacity-100" />

              <div className="relative flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-secondary text-primary ring-1 ring-inset ring-primary/10 group-hover:bg-primary/10">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="relative mt-3.5 font-heading text-[15px] font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="relative mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA banner ---------- */}
      <section className="max-w-6xl px-4 pb-16 mx-auto sm:px-6 lg:pb-20">
        <div className="relative p-6 overflow-hidden text-center border rounded-2xl border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent sm:p-8 animate-fade-up">
          <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-24 left-1/2 bg-primary/15 blur-3xl" />
          <h3 className="relative font-heading text-[20px] font-bold tracking-tight sm:text-[24px]">
            Siap mulai belanja virtual number?
          </h3>
          <p className="relative mx-auto mt-1.5 max-w-md text-[13px] text-muted-foreground">
            Daftar sekarang dan nikmati proses cepat, aman, dan pembayaran manual yang mudah.
          </p>
          <div className="relative mt-5 flex flex-wrap justify-center gap-2.5">
            <Link to="/register">
              <Button
                size="sm"
                className="group h-10 rounded-lg px-5 text-[13.5px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                Daftar Gratis
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-lg px-5 text-[13.5px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground">
              <Zap className="w-3 h-3" strokeWidth={2.5} />
            </span>
            <span>
              {settings.footer || "© 2026 Quick Order (QO). All rights reserved."}
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground/80">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Aman & terenkripsi
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}