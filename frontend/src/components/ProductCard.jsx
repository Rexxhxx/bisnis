import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, mediaUrl } from "@/lib/api";

export function ProductCard({ product, currency, onAdd }) {
  const [loading, setLoading] = useState(false);
  const finalPrice = product.price - (product.discount || 0);
  const outOfStock = product.stock <= 0 || product.status !== "active";

  const handleAdd = async () => {
    setLoading(true);
    try {
      await onAdd(product.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={mediaUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.promo_badge && (
          <Badge className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {product.promo_badge}
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-destructive px-4 py-1.5 text-sm font-semibold text-destructive-foreground">Stok Habis</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-bold">{product.name}</h3>
          <span className={`flex items-center gap-1 text-xs font-medium ${outOfStock ? "text-destructive" : "text-primary"}`}>
            {!outOfStock && <Check className="h-3 w-3" />}
            {outOfStock ? "Habis" : `Stok ${product.stock}`}
          </span>
        </div>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-4 flex items-end gap-2">
          <span className="font-heading text-2xl font-bold text-foreground" data-testid={`product-price-${product.id}`}>
            {formatMoney(finalPrice, currency)}
          </span>
          {product.discount > 0 && (
            <span className="mb-1 text-sm text-muted-foreground line-through">{formatMoney(product.price, currency)}</span>
          )}
        </div>

        <Button
          onClick={handleAdd}
          disabled={loading || outOfStock}
          data-testid={`checkout-btn-${product.id}`}
          className="mt-5 h-11 w-full rounded-full text-base"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" /> Checkout
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
