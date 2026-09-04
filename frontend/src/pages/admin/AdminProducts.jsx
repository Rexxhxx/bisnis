import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = { name: "", description: "", price: 0, discount: 0, image: "", stock: 100, category: "Virtual Number", status: "active", promo_badge: "" };

export default function AdminProducts() {
  const { settings } = useSettings();
  const [products, setProducts] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => api.get("/products?all=true").then(({ data }) => setProducts(data)).catch(() => setProducts([]));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p, promo_badge: p.promo_badge || "" }); setOpen(true); };

  const save = async () => {
    if (!form.name || !form.price) { toast.error("Nama dan harga wajib diisi"); return; }
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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">Kelola katalog virtual number.</p>
        </div>
        <Button onClick={openNew} className="rounded-full" data-testid="admin-add-product-btn"><Plus className="mr-2 h-4 w-4" /> Tambah</Button>
      </div>

      {products === null ? (
        <div className="mt-8 grid gap-5 md:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="admin-products-grid">
          {products.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="relative aspect-video bg-muted">
                <img src={mediaUrl(p.image)} alt={p.name} className="h-full w-full object-cover" />
                <Badge className={`absolute right-3 top-3 rounded-full ${p.status === "active" ? "bg-primary" : "bg-muted-foreground"}`}>{p.status}</Badge>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground">Stok {p.stock}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-3 font-heading text-lg font-bold">{formatMoney(p.price - (p.discount || 0), settings.currency)}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => openEdit(p)} data-testid={`admin-edit-product-${p.id}`}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="outline" size="sm" className="rounded-full text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)} data-testid={`admin-delete-product-${p.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Produk" : "Tambah Produk"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama</Label><Input value={form.name} onChange={set("name")} className="mt-1.5" data-testid="product-form-name" /></div>
            <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={set("description")} className="mt-1.5" data-testid="product-form-desc" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Harga</Label><Input type="number" value={form.price} onChange={set("price")} className="mt-1.5" data-testid="product-form-price" /></div>
              <div><Label>Diskon</Label><Input type="number" value={form.discount} onChange={set("discount")} className="mt-1.5" data-testid="product-form-discount" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Stok</Label><Input type="number" value={form.stock} onChange={set("stock")} className="mt-1.5" data-testid="product-form-stock" /></div>
              <div><Label>Kategori</Label><Input value={form.category} onChange={set("category")} className="mt-1.5" /></div>
            </div>
            <div><Label>URL Gambar (opsional)</Label><Input value={form.image} onChange={set("image")} className="mt-1.5" placeholder="https://... atau upload di bawah" data-testid="product-form-image" /></div>
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Upload Gambar Produk" testId="product-image-upload" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Badge Promo</Label><Input value={form.promo_badge} onChange={set("promo_badge")} className="mt-1.5" placeholder="Promo (opsional)" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving} className="rounded-full" data-testid="product-form-save-btn">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus produk?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="rounded-full bg-destructive hover:bg-destructive/90" data-testid="confirm-delete-product-btn">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
