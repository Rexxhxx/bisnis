import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  ShoppingCart,
  Package,
  Sparkles,
  Receipt,
  ShieldCheck,
} from "lucide-react";
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
  const itemCount = cart?.items?.length || 0;

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto sm:px-6 lg:py-10">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Kelola item belanja Anda</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Keranjang Belanja
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          {cart === null
            ? "Memuat keranjang..."
            : itemCount > 0
            ? `${itemCount} produk siap untuk di-checkout.`
            : "Keranjang Anda masih kosong."}
        </p>
      </div>

      {cart === null ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-[92px] rounded-xl animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <Skeleton
            className="h-56 rounded-xl animate-fade-up [animation-delay:180ms]"
          />
        </div>
      ) : cart.items.length === 0 ? (
        <EmptyState onShop={() => navigate("/products")} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-3 lg:col-span-2" data-testid="cart-items">
            {cart.items.map((item, idx) => (
              <CartItem
                key={item.product_id}
                item={item}
                currency={currency}
                onRemove={() => remove(item.product_id)}
                delay={60 + idx * 60}
              />
            ))}
          </div>

          {/* Summary */}
          <SummaryCard
            cart={cart}
            currency={currency}
            checkingOut={checkingOut}
            onCheckout={checkout}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Cart Item ---------- */
function CartItem({ item, currency, onRemove, delay = 0 }) {
  return (
    <div
      className="group flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      data-testid={`cart-item-${item.product_id}`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        <img
          src={mediaUrl(item.image)}
          alt={item.name}
          className="object-cover w-16 h-16 rounded-lg ring-1 ring-inset ring-border/60"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <h3 className="font-heading text-[13.5px] font-semibold tracking-tight truncate">
            {item.name}
          </h3>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
          <span className="font-medium tabular-nums">
            {formatMoney(item.total, currency)}
          </span>
          {item.discount > 0 && (
            <>
              <span className="line-through text-muted-foreground/60 tabular-nums">
                {formatMoney(item.price, currency)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary ring-1 ring-inset ring-primary/15">
                <Sparkles className="h-2.5 w-2.5" />
                Hemat {formatMoney(item.discount, currency)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label="Hapus produk"
        className="p-2 transition-all rounded-lg shrink-0 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
        data-testid={`cart-remove-${item.product_id}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ---------- Summary Card ---------- */
function SummaryCard({ cart, currency, checkingOut, onCheckout }) {
  return (
    <div className="h-fit rounded-xl border border-border/70 bg-card p-5 shadow-sm lg:sticky lg:top-20 animate-fade-up [animation-delay:180ms]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-primary ring-1 ring-inset ring-primary/10">
          <Receipt className="w-4 h-4" />
        </span>
        <h3 className="font-heading text-[15px] font-semibold tracking-tight">
          Ringkasan Pesanan
        </h3>
      </div>

      {/* Rows */}
      <div className="mt-4 space-y-2.5 text-[12.5px]">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">
            {formatMoney(cart.subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Diskon</span>
          <span className="tabular-nums text-primary">
            -{formatMoney(cart.discount, currency)}
          </span>
        </div>

        <div className="border-t border-border/70 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-[13.5px] font-semibold">
              Total
            </span>
            <span
              className="font-heading text-[17px] font-bold tabular-nums"
              data-testid="cart-total"
            >
              {formatMoney(cart.total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout */}
      <Button
        onClick={onCheckout}
        disabled={checkingOut}
        size="sm"
        className="group mt-5 h-10 w-full rounded-lg text-[13.5px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        data-testid="cart-checkout-btn"
      >
        {checkingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            Lanjut Checkout
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </Button>

      {/* Trust hint */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Pembayaran aman & terverifikasi</span>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onShop }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up"
      data-testid="cart-empty"
    >
      {/* subtle glow */}
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <ShoppingBag className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[17px] font-semibold tracking-tight">
        Keranjang masih kosong
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[13px] text-muted-foreground">
        Yuk pilih virtual number favorit Anda dan mulai belanja sekarang.
      </p>

      <Button
        onClick={onShop}
        size="sm"
        className="group relative mt-5 h-9 rounded-lg text-[13px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        data-testid="cart-go-shop-btn"
      >
        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
        Lihat Produk
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  );
}