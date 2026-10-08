import { Link } from "react-router-dom";
import {
  Zap,
  Mail,
  MessageCircle,
  Globe,
  ShieldCheck,
  Headphones,
  Package,
  ChevronRight,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function Footer() {
  const { settings } = useSettings();

  const productLinks = ["Japan Number", "Canada Number", "Indonesia Number"];
  const helpLinks = ["Cara Order", "Pembayaran Manual", "Konfirmasi"];

  return (
    <footer className="mt-16 border-t border-border/60 bg-card">
      <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* ---------- Brand ---------- */}
          <div className="lg:col-span-5 animate-fade-up">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg shadow-sm h-9 w-9 bg-primary text-primary-foreground">
                <Zap className="h-4.5 w-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-[15px] font-semibold tracking-tight">
                {settings.site_name || "Quick Order"}
              </span>
            </div>

            <p className="mt-3.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
              {settings.banner ||
                "Beli Virtual Number cepat, aman, dan terpercaya."}
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="w-3 h-3 text-primary" />
                Aman & terpercaya
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Globe className="w-3 h-3 text-primary" />
                Multi-negara
              </span>
            </div>
          </div>

          {/* ---------- Produk ---------- */}
          <FooterColumn
            title="Produk"
            icon={Package}
            links={productLinks}
            delay={80}
            className="lg:col-span-2"
          />

          {/* ---------- Bantuan ---------- */}
          <FooterColumn
            title="Bantuan"
            icon={Headphones}
            links={helpLinks}
            delay={140}
            className="lg:col-span-2"
          />

          {/* ---------- Kontak ---------- */}
          <div
            className="lg:col-span-3 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <h4 className="font-heading text-[12.5px] font-semibold uppercase tracking-wider text-foreground/80">
              Kontak
            </h4>
            <ul className="mt-3 space-y-2">
              <ContactItem
                icon={Mail}
                href={`mailto:${settings.contact || "support@quickorder.id"}`}
                label={settings.contact || "support@quickorder.id"}
                tone="primary"
              />
              <ContactItem
                icon={MessageCircle}
                href={
                  settings.whatsapp_owner
                    ? `https://wa.me/${settings.whatsapp_owner.replace(/\D/g, "")}`
                    : undefined
                }
                label={`WA: ${settings.whatsapp_owner || "-"}`}
                tone="success"
              />
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2.5 px-4 py-5 text-[11.5px] text-muted-foreground sm:flex-row sm:px-6">
          <p className="text-center sm:text-left">
            {settings.footer ||
              "© 2026 Quick Order (QO). All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Data aman & terenkripsi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Footer Column ---------- */
function FooterColumn({ title, icon: Icon, links, delay = 0, className = "" }) {
  return (
    <div
      className={`animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h4 className="flex items-center gap-1.5 font-heading text-[12.5px] font-semibold uppercase tracking-wider text-foreground/80">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}>
            <span className="group inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              {link}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Contact Item ---------- */
function ContactItem({ icon: Icon, href, label, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15",
  };

  const content = (
    <>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ${tones[tone]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[12.5px] text-muted-foreground transition-colors group-hover:text-foreground truncate">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex w-full items-center gap-2.5"
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li className="group inline-flex w-full items-center gap-2.5">
      {content}
    </li>
  );
}