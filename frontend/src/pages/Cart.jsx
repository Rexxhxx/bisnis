import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import api, { apiError, formatMoney, mediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const { refreshCart } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (e) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      const { data } = await api.delete(`/cart/${id}`);
      setCart(data);
      await refreshCart();
      toast.success("Produk dihapus dari keranjang");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const { data } = await api.post("/orders/checkout");
      await refreshCart();
      toast.success("Invoice dibuat");
      navigate(`/invoice/${data.id}`);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setCheckingOut(false);
    }
  };

  const currency = settings.currency;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-bold tracking-tight">Keranjang Belanja</h1>

      {cart === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center" data-testid="cart-empty">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="mt-5 font-heading text-xl font-semibold">Keranjang masih kosong</h3>
          <p className="mt-2 text-muted-foreground">Yuk pilih virtual number favorit Anda.</p>
          <Button onClick={() => navigate("/products")} className="mt-6 rounded-full" data-testid="cart-go-shop-btn">
            Lihat Produk
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2" data-testid="cart-items">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <img src={mediaUrl(item.image)} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-heading font-semibold">{item.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-medium">{formatMoney(item.total, currency)}</span>
                    {item.discount > 0 && (
                      <>
                        <span className="text-muted-foreground line-through">{formatMoney(item.price, currency)}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary">-{formatMoney(item.discount, currency)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  data-testid={`cart-remove-${item.product_id}`}
                  onClick={() => remove(item.product_id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="font-heading text-lg font-bold">Ringkasan</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(cart.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Diskon</span>
                <span className="text-primary">-{formatMoney(cart.discount, currency)}</span>
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between font-heading text-lg font-bold">
                <span>Total</span>
                <span data-testid="cart-total">{formatMoney(cart.total, currency)}</span>
              </div>
            </div>
            <Button onClick={checkout} disabled={checkingOut} className="mt-6 h-11 w-full rounded-full text-base" data-testid="cart-checkout-btn">
              {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Lanjut Checkout <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
