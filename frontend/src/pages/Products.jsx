import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PackageSearch, Sparkles, ShoppingBag, Grid3x3 } from "lucide-react";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <Grid3x3 className="h-3.5 w-3.5" />
          <span>Katalog virtual number</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Katalog Produk
        </h1>
        <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-muted-foreground">
          Pilih virtual number sesuai kebutuhan Anda. Tekan tombol tambah untuk
          memasukkannya ke keranjang.
        </p>
      </div>

      {products === null ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState onExplore={() => navigate("/dashboard")} />
      ) : (
        <>
          {/* Result count */}
          <div className="mb-4 flex items-center justify-between animate-fade-up [animation-delay:60ms]">
            <p className="text-[12.5px] text-muted-foreground">
              Menampilkan{" "}
              <span className="font-medium text-foreground/80">
                {products.length}
              </span>{" "}
              produk
            </p>
            <div className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground/80">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Harga terbaik hari ini</span>
            </div>
          </div>

          {/* Grid */}
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="products-grid"
          >
            {products.map((p, idx) => (
              <div
                key={p.id}
                className="animate-fade-up"
                style={{ animationDelay: `${120 + idx * 50}ms` }}
              >
                <ProductCard
                  product={p}
                  currency={settings.currency}
                  onAdd={addToCart}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Skeleton Grid ---------- */
function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton
          key={i}
          className="h-[340px] rounded-xl animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onExplore }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up"
      data-testid="products-empty"
    >
      {/* subtle glow */}
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <PackageSearch className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[17px] font-semibold tracking-tight">
        Belum ada produk tersedia
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[13px] text-muted-foreground">
        Produk akan muncul di sini setelah tersedia. Silakan cek kembali nanti.
      </p>

      <Button
        onClick={onExplore}
        size="sm"
        className="group relative mt-5 h-9 rounded-lg text-[13px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
        Kembali ke Dashboard
      </Button>
    </div>
  );
}