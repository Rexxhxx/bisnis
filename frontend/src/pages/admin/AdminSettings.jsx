import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Settings2,
  Globe,
  Wallet,
  Landmark,
  MessageCircle,
  Mail,
  Coins,
  Image as ImageIcon,
  Sparkles,
  FileText,
  LayoutTemplate,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";

/* Grouped fields for better UX */
const SECTIONS = [
  {
    title: "Informasi Website",
    desc: "Identitas dan kontak utama website Anda.",
    icon: Globe,
    fields: [
      { key: "site_name", label: "Nama Website", placeholder: "Quick Order" },
      {
        key: "whatsapp_owner",
        label: "WhatsApp Owner",
        placeholder: "628123456789",
        hint: "Format internasional tanpa tanda +",
      },
      {
        key: "contact",
        label: "Kontak (Email)",
        placeholder: "admin@contoh.com",
        type: "email",
      },
      {
        key: "currency",
        label: "Mata Uang",
        placeholder: "Rp",
        hint: "Contoh: Rp, $, RM",
      },
    ],
  },
  {
    title: "Pembayaran DANA",
    desc: "Informasi penerima pembayaran via DANA.",
    icon: Wallet,
    fields: [
      { key: "dana_name", label: "Nama Penerima", placeholder: "Nama Anda" },
      { key: "dana_number", label: "Nomor DANA", placeholder: "08xxxxxxxxxx" },
    ],
  },
  {
    title: "Pembayaran Bank BRI",
    desc: "Informasi rekening bank untuk transfer.",
    icon: Landmark,
    fields: [
      { key: "bri_name", label: "Nama Rekening", placeholder: "Nama Anda" },
      { key: "bri_number", label: "Nomor Rekening", placeholder: "xxxxxxxxxx" },
    ],
  },
];

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/settings", form);
      setSettings(data);
      toast.success("Pengaturan disimpan");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <Settings2 className="h-3.5 w-3.5" />
          <span>Kelola informasi website & pembayaran manual</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Settings
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Sesuaikan pengaturan agar sesuai dengan kebutuhan bisnis Anda.
        </p>
      </div>

      {/* ---------- Form ---------- */}
      <div
        className="space-y-6 animate-fade-up [animation-delay:60ms]"
        data-testid="admin-settings-form"
      >
        {/* Grouped sections */}
        {SECTIONS.map((section, sIdx) => (
          <SectionCard
            key={section.title}
            {...section}
            form={form}
            onChange={set}
            delay={120 + sIdx * 80}
          />
        ))}

        {/* ---------- Media Section ---------- */}
        <SectionCard
          title="Media & Branding"
          desc="Logo dan gambar QRIS untuk pembayaran."
          icon={ImageIcon}
          delay={360}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload
              value={form.logo || ""}
              onChange={(url) => setForm({ ...form, logo: url })}
              label="Logo Website"
              testId="setting-logo-upload"
            />
            <ImageUpload
              value={form.qris_image || ""}
              onChange={(url) => setForm({ ...form, qris_image: url })}
              label="Gambar QRIS"
              testId="setting-qris-upload"
            />
          </div>
        </SectionCard>

        {/* ---------- Content Section ---------- */}
        <SectionCard
          title="Konten Halaman"
          desc="Banner dan footer yang tampil di halaman publik."
          icon={LayoutTemplate}
          delay={440}
        >
          <div className="space-y-3.5">
            <div>
              <Label
                htmlFor="setting-banner"
                className="text-[12.5px] font-medium text-foreground/80"
              >
                Banner
              </Label>
              <Textarea
                id="setting-banner"
                value={form.banner || ""}
                onChange={set("banner")}
                placeholder="Teks banner yang tampil di landing page"
                className="mt-1.5 min-h-[80px] resize-none rounded-lg text-[13px]"
                data-testid="setting-banner"
              />
            </div>
            <div>
              <Label
                htmlFor="setting-footer"
                className="text-[12.5px] font-medium text-foreground/80"
              >
                Footer
              </Label>
              <Textarea
                id="setting-footer"
                value={form.footer || ""}
                onChange={set("footer")}
                placeholder="Teks footer (copyright, dll)"
                className="mt-1.5 min-h-[70px] resize-none rounded-lg text-[13px]"
                data-testid="setting-footer"
              />
            </div>
          </div>
        </SectionCard>

        {/* ---------- Save Action ---------- */}
        <div className="flex justify-end animate-fade-up [animation-delay:520ms]">
          <Button
            onClick={save}
            disabled={saving}
            size="sm"
            className="group h-10 rounded-lg px-5 text-[13.5px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            data-testid="save-settings-btn"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Section Card ---------- */
function SectionCard({ title, desc, icon: Icon, fields, form = {}, onChange, delay = 0, children }) {
  return (
    <div
      className="overflow-hidden border shadow-sm rounded-xl border-border/70 bg-card animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/70 bg-secondary/30">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-secondary text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-[14px] font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-[11.5px] text-muted-foreground truncate">{desc}</p>
        </div>
      </div>

      {/* Section body */}
      <div className="p-4 sm:p-5">
        {fields ? (
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                <Label
                  htmlFor={`setting-${f.key}`}
                  className="text-[12.5px] font-medium text-foreground/80"
                >
                  {f.label}
                </Label>
                <Input
                  id={`setting-${f.key}`}
                  type={f.type || "text"}
                  value={form[f.key] || ""}
                  onChange={onChange(f.key)}
                  placeholder={f.placeholder}
                  className="mt-1.5 h-9 rounded-lg text-[13px]"
                  data-testid={`setting-${f.key}`}
                />
                {f.hint && (
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    {f.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}