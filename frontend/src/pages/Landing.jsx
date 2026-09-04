import { Link } from "react-router-dom";
import { Zap, ArrowRight, ShieldCheck, Wallet, Zap as Bolt, Globe } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const HERO = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Zap className="h-5 w-5" /></span>
            <span className="font-heading text-lg font-bold">{settings.site_name || "Quick Order"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login"><Button variant="ghost" className="rounded-full" data-testid="landing-login-btn">Masuk</Button></Link>
            <Link to="/register"><Button className="rounded-full" data-testid="landing-register-btn">Daftar</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
              <Bolt className="h-3.5 w-3.5" /> Virtual Number Store
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Beli Virtual Number <span className="text-primary">Cepat & Aman</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              {settings.banner || "Japan, Canada & Indonesia number siap pakai. Pembayaran manual mudah via DANA, BRI, dan QRIS."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register"><Button className="h-12 rounded-full px-7 text-base">Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/login"><Button variant="outline" className="h-12 rounded-full px-7 text-base">Sudah punya akun</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
              <img src={HERO} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Bolt, title: "Aktivasi Instan", desc: "Nomor virtual langsung aktif setelah pembayaran dikonfirmasi." },
            { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Konfirmasi pembayaran diverifikasi manual oleh admin." },
            { icon: Wallet, title: "Bayar Fleksibel", desc: "Mendukung DANA, Bank BRI, dan QRIS all payment." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary"><f.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-heading text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        {settings.footer || "© 2026 Quick Order (QO). All rights reserved."}
      </footer>
    </div>
  );
}
