import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  AtSign,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Captcha } from "@/components/Captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HERO =
  "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
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
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.1fr]">
      {/* Left - Form */}
      <div className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        {/* subtle background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full -left-24 -top-24 h-72 w-72 bg-primary/10 blur-3xl" />
          <div className="absolute rounded-full -bottom-24 -right-24 h-72 w-72 bg-primary/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-[360px]">
          {/* Brand */}
          <div className="mb-7 flex items-center gap-2.5 animate-fade-up">
            <span className="flex items-center justify-center rounded-lg shadow-sm h-9 w-9 bg-primary text-primary-foreground">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              Quick Order
            </span>
          </div>

          {/* Heading */}
          <div className="animate-fade-up [animation-delay:60ms]">
            <h1 className="font-heading text-[26px] font-bold leading-tight tracking-tight">
              Buat akun baru
            </h1>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              Daftar untuk mulai membeli virtual number.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={submit}
            className="mt-7 space-y-3.5 animate-fade-up [animation-delay:120ms]"
            data-testid="register-form"
          >
            <Field
              id="r-username"
              label="Username"
              icon={AtSign}
              value={form.username}
              onChange={set("username")}
              placeholder="username unik"
              testId="register-username-input"
            />
            <Field
              id="r-name"
              label="Nama Lengkap"
              icon={User}
              value={form.full_name}
              onChange={set("full_name")}
              placeholder="Nama Anda"
              testId="register-name-input"
            />
            <Field
              id="r-email"
              label="Email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={set("email")}
              placeholder="email@contoh.com"
              testId="register-email-input"
            />
            <Field
              id="r-phone"
              label="Nomor Pengguna"
              icon={Phone}
              value={form.phone}
              onChange={set("phone")}
              placeholder="08xxxxxxxxxx"
              testId="register-phone-input"
            />
            <Field
              id="r-password"
              label="Password"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={set("password")}
              placeholder="Minimal 8 karakter"
              testId="register-password-input"
            />

            <div className="pt-1">
              <Captcha onValidChange={onCaptcha} />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="register-submit-btn"
              className="group relative h-10 w-full rounded-lg text-[14px] font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Daftar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-5 text-center text-[13px] text-muted-foreground animate-fade-up [animation-delay:180ms]">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              data-testid="go-login-link"
            >
              Masuk
            </Link>
          </p>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground/80 animate-fade-up [animation-delay:240ms]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Data Anda aman & terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Right - Hero */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={HERO}
          alt=""
          className="h-full w-full scale-105 object-cover animate-[fadeIn_1.2s_ease-out]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/50 to-green-950/20" />

        {/* Floating glass card */}
        <div className="absolute inset-0 flex items-end p-10 xl:p-14">
          <div className="w-full max-w-md animate-fade-up [animation-delay:300ms]">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
              <Zap className="w-3 h-3" strokeWidth={2.5} />
              Virtual Number Platform
            </div>
            <h2 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-white xl:text-[32px]">
              Bergabung dengan Quick Order
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Proses cepat, aman, dan pembayaran manual yang mudah lewat DANA,
              BRI & QRIS.
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-7">
              {[
                { label: "Proses", value: "Instan" },
                { label: "Pembayaran", value: "Manual" },
                { label: "Support", value: "24/7" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md animate-fade-up"
                  style={{ animationDelay: `${380 + i * 60}ms` }}
                >
                  <p className="text-[10.5px] uppercase tracking-wider text-white/55">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-[13.5px] font-semibold text-white">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Field with leading icon ---------- */
function Field({
  id,
  label,
  icon: Icon, // <-- sekarang terima component, bukan JSX
  type = "text",
  value,
  onChange,
  placeholder,
  testId,
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="text-[12.5px] font-medium text-foreground/80"
      >
        {label}
      </Label>

      {/* Wrapper dengan posisi relative + tinggi eksplisit */}
      <div className="group relative mt-1.5 h-10 w-full">
        {/* Icon container — absolute, ukuran fix, tidak ikut reflow */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 z-10 flex items-center justify-center w-10 transition-colors pointer-events-none text-muted-foreground/70 group-focus-within:text-primary"
        >
          <Icon className="w-4 h-4" />
        </span>

        {/* Input — padding-left 40px supaya tidak nabrak icon */}
        <Input
          id={id}
          type={type}
          data-testid={testId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg pl-10 pr-3 text-[13.5px] transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>
    </div>
  );
}