import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Captcha } from "@/components/Captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HERO = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", full_name: "", email: "", phone: "", password: "" });
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCaptcha = useCallback((v) => setCaptchaValid(v), []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.phone || !form.password) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (!captchaValid) {
      toast.error("CAPTCHA belum benar");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Registrasi berhasil! Selamat datang.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </span>
            <span className="font-heading text-lg font-bold">Quick Order</span>
          </div>
          <h1 className="font-heading text-3xl font-bold">Buat akun baru</h1>
          <p className="mt-2 text-muted-foreground">Daftar untuk mulai membeli virtual number.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="register-form">
            <div>
              <Label htmlFor="r-username">Username</Label>
              <Input id="r-username" data-testid="register-username-input" value={form.username} onChange={set("username")} placeholder="username unik" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="r-name">Nama Lengkap</Label>
              <Input id="r-name" data-testid="register-name-input" value={form.full_name} onChange={set("full_name")} placeholder="Nama Anda" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="r-email">Email</Label>
              <Input id="r-email" type="email" data-testid="register-email-input" value={form.email} onChange={set("email")} placeholder="email@contoh.com" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="r-phone">Nomor Pengguna</Label>
              <Input id="r-phone" data-testid="register-phone-input" value={form.phone} onChange={set("phone")} placeholder="08xxxxxxxxxx" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="r-password">Password</Label>
              <Input id="r-password" type="password" data-testid="register-password-input" value={form.password} onChange={set("password")} placeholder="Minimal 8 karakter" className="mt-1.5 h-11" />
            </div>
            <Captcha onValidChange={onCaptcha} />
            <Button type="submit" disabled={loading} data-testid="register-submit-btn" className="h-11 w-full rounded-full text-base">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Daftar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline" data-testid="go-login-link">
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img src={HERO} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-heading text-3xl font-bold leading-tight">Bergabung dengan Quick Order</h2>
          <p className="mt-3 max-w-md text-white/80">Proses cepat, aman, dan pembayaran manual yang mudah lewat DANA, BRI & QRIS.</p>
        </div>
      </div>
    </div>
  );
}
