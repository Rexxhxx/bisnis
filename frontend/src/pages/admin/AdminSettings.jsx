import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import api, { apiError } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";

const FIELDS = [
  { key: "site_name", label: "Nama Website" },
  { key: "whatsapp_owner", label: "WhatsApp Owner (contoh: 628123456789)" },
  { key: "dana_name", label: "Nama Penerima DANA" },
  { key: "dana_number", label: "Nomor DANA" },
  { key: "bri_name", label: "Nama Rekening BRI" },
  { key: "bri_number", label: "Nomor Rekening BRI" },
  { key: "currency", label: "Mata Uang (contoh: Rp)" },
  { key: "contact", label: "Kontak (Email)" },
];

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings || {}); }, [settings]);

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
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Kelola informasi website & pembayaran manual.</p>

      <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm" data-testid="admin-settings-form">
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input value={form[f.key] || ""} onChange={set(f.key)} className="mt-1.5" data-testid={`setting-${f.key}`} />
            </div>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUpload value={form.logo || ""} onChange={(url) => setForm({ ...form, logo: url })} label="Logo Website" testId="setting-logo-upload" />
          <ImageUpload value={form.qris_image || ""} onChange={(url) => setForm({ ...form, qris_image: url })} label="Gambar QRIS" testId="setting-qris-upload" />
        </div>
        <div>
          <Label>Banner</Label>
          <Textarea value={form.banner || ""} onChange={set("banner")} className="mt-1.5" data-testid="setting-banner" />
        </div>
        <div>
          <Label>Footer</Label>
          <Textarea value={form.footer || ""} onChange={set("footer")} className="mt-1.5" data-testid="setting-footer" />
        </div>

        <Button onClick={save} disabled={saving} className="rounded-full" data-testid="save-settings-btn">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan Pengaturan</>}
        </Button>
      </div>
    </div>
  );
}
