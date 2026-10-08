import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Package,
  Layers,
  Tag,
  Sparkles,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";
import api, { apiError, formatMoney, mediaUrl } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY = {
  name: "",
  description: "",
  price: 0,
  discount: 0,
  image: "",
  stock: 100,
  category: "Virtual Number",
  status: "active",
  promo_badge: "",
};

export default function AdminProducts() {
  const { settings } = useSettings();
  const [products, setProducts] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () =>
    api
      .get("/products?all=true")
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]));

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, promo_badge: p.promo_badge || "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      promo_badge: form.promo_badge || null,
    };
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Produk diperbarui" : "Produk ditambahkan");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success("Produk dihapus");
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
            <Package className="h-3.5 w-3.5" />
            <span>Kelola katalog virtual number</span>
          </div>
          <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
            Products
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Tambah, edit, dan atur produk yang Anda jual.
          </p>
        </div>

        <Button
          onClick={openNew}
          size="sm"
          className="group h-9 rounded-lg text-[13px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          data-testid="admin-add-product-btn"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
          Tambah Produk
        </Button>
      </div>

      {/* ---------- Grid ---------- */}
      {products === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-[300px] rounded-xl animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="admin-products-grid"
        >
          {products.map((p, idx) => (
            <ProductAdminCard
              key={p.id}
              product={p}
              currency={settings.currency}
              onEdit={() => openEdit(p)}
              onDelete={() => setDeleteId(p.id)}
              delay={60 + idx * 50}
            />
          ))}
        </div>
      )}

      {/* ---------- Form Dialog ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg h-9 w-9 bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                {editing ? (
                  <Pencil className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </span>
              <div>
                <DialogTitle className="font-heading text-[15px] font-semibold tracking-tight">
                  {editing ? "Edit Produk" : "Tambah Produk"}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  {editing
                    ? "Perbarui informasi produk di bawah ini."
                    : "Lengkapi informasi produk baru."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 pt-1">
            <FormField label="Nama Produk" htmlFor="p-name">
              <Input
                id="p-name"
                value={form.name}
                onChange={set("name")}
                placeholder="Contoh: Japan Number"
                className="h-9 rounded-lg text-[13px]"
                data-testid="product-form-name"
              />
            </FormField>

            <FormField label="Deskripsi" htmlFor="p-desc">
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={set("description")}
                placeholder="Deskripsi singkat produk"
                className="min-h-[80px] resize-none rounded-lg text-[13px]"
                data-testid="product-form-desc"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Harga" htmlFor="p-price">
                <Input
                  id="p-price"
                  type="number"
                  value={form.price}
                  onChange={set("price")}
                  className="h-9 rounded-lg text-[13px] tabular-nums"
                  data-testid="product-form-price"
                />
              </FormField>
              <FormField label="Diskon" htmlFor="p-discount">
                <Input
                  id="p-discount"
                  type="number"
                  value={form.discount}
                  onChange={set("discount")}
                  className="h-9 rounded-lg text-[13px] tabular-nums"
                  data-testid="product-form-discount"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Stok" htmlFor="p-stock">
                <Input
                  id="p-stock"
                  type="number"
                  value={form.stock}
                  onChange={set("stock")}
                  className="h-9 rounded-lg text-[13px] tabular-nums"
                  data-testid="product-form-stock"
                />
              </FormField>
              <FormField label="Kategori" htmlFor="p-category">
                <Input
                  id="p-category"
                  value={form.category}
                  onChange={set("category")}
                  className="h-9 rounded-lg text-[13px]"
                />
              </FormField>
            </div>

            <FormField label="URL Gambar (opsional)" htmlFor="p-image">
              <Input
                id="p-image"
                value={form.image}
                onChange={set("image")}
                placeholder="https://... atau upload di bawah"
                className="h-9 rounded-lg text-[13px]"
                data-testid="product-form-image"
              />
            </FormField>

            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              label="Upload Gambar Produk"
              testId="product-image-upload"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Status">
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="h-9 rounded-lg text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Badge Promo" htmlFor="p-promo">
                <Input
                  id="p-promo"
                  value={form.promo_badge}
                  onChange={set("promo_badge")}
                  placeholder="Opsional"
                  className="h-9 rounded-lg text-[13px]"
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-[13px]"
              onClick={() => setOpen(false)}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Batal
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              size="sm"
              className="h-9 rounded-lg text-[13px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              data-testid="product-form-save-btn"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {editing ? "Simpan Perubahan" : "Simpan Produk"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete Dialog ---------- */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-md rounded-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg h-9 w-9 bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div>
                <AlertDialogTitle className="font-heading text-[15px] font-semibold tracking-tight">
                  Hapus produk ini?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="h-9 rounded-lg text-[13px] mt-0 sm:mt-0">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="h-9 rounded-lg bg-destructive text-[13px] font-medium hover:bg-destructive/90"
              data-testid="confirm-delete-product-btn"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Product Card ---------- */
function ProductAdminCard({ product: p, currency, onEdit, onDelete, delay = 0 }) {
  const finalPrice = p.price - (p.discount || 0);
  const hasDiscount = p.discount > 0;

  return (
    <div
      className="group overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video bg-muted">
        <img
          src={mediaUrl(p.image)}
          alt={p.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status badge */}
        <Badge
          className={`absolute right-2.5 top-2.5 rounded-full text-[10.5px] font-medium px-2 py-0.5 ${
            p.status === "active"
              ? "bg-emerald-500/90 text-white hover:bg-emerald-500/90"
              : "bg-muted-foreground/80 text-white hover:bg-muted-foreground/80"
          }`}
        >
          {p.status}
        </Badge>

        {/* Promo badge */}
        {p.promo_badge && (
          <Badge className="absolute left-2.5 top-2.5 rounded-full bg-primary/90 text-primary-foreground text-[10.5px] font-medium px-2 py-0.5 hover:bg-primary/90">
            <Sparkles className="mr-1 h-2.5 w-2.5" />
            {p.promo_badge}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[14px] font-semibold tracking-tight truncate">
            {p.name}
          </h3>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Stok {p.stock}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {p.description || "-"}
        </p>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="font-heading text-[16px] font-bold tabular-nums">
            {formatMoney(finalPrice, currency)}
          </span>
          {hasDiscount && (
            <span className="text-[11.5px] text-muted-foreground/70 line-through tabular-nums">
              {formatMoney(p.price, currency)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3.5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 rounded-lg text-[12.5px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
            onClick={onEdit}
            data-testid={`admin-edit-product-${p.id}`}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 transition-all rounded-lg border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
            onClick={onDelete}
            aria-label="Hapus produk"
            data-testid={`admin-delete-product-${p.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Form Field ---------- */
function FormField({ label, htmlFor, children }) {
  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className="text-[12.5px] font-medium text-foreground/80"
      >
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onAdd }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up">
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <Package className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[16px] font-semibold tracking-tight">
        Belum ada produk
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[12.5px] text-muted-foreground">
        Tambahkan produk pertama Anda untuk mulai berjualan virtual number.
      </p>

      <Button
        onClick={onAdd}
        size="sm"
        className="group relative mt-5 h-9 rounded-lg text-[13px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
        Tambah Produk
      </Button>
    </div>
  );
}