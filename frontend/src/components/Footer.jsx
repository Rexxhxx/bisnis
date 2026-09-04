import { Zap, Mail, MessageCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-bold">{settings.site_name || "Quick Order"}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings.banner || "Beli Virtual Number cepat, aman, dan terpercaya."}
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Produk</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Japan Number</li>
            <li>Canada Number</li>
            <li>Indonesia Number</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Bantuan</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Cara Order</li>
            <li>Pembayaran Manual</li>
            <li>Konfirmasi</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Kontak</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {settings.contact || "support@quickorder.id"}
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WA: {settings.whatsapp_owner || "-"}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {settings.footer || "© 2026 Quick Order (QO). All rights reserved."}
      </div>
    </footer>
  );
}
