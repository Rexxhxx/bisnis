import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const { refreshCart } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (e) {
      setProducts([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (id) => {
    try {
      await api.post("/cart", { product_id: id });
      await refreshCart();
      toast.success("Produk masuk ke keranjang", {
        action: { label: "Lihat Cart", onClick: () => navigate("/cart") },
      });
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 animate-fade-up">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Katalog Produk</h1>
        <p className="mt-2 max-w-lg text-muted-foreground">Pilih virtual number sesuai kebutuhan Anda. Tekan Checkout untuk menambahkan ke keranjang.</p>
      </div>

      {products === null ? (
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3" data-testid="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} currency={settings.currency} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
