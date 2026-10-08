import { useState } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const HERO =
  "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const user = await login(username, password, remember);
      toast.success("Login berhasil");
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Right - Form */}
      <div className="relative flex items-center justify-center order-2 px-5 py-10 sm:px-8 lg:order-1">
        {/* subtle background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full -right-24 -top-24 h-72 w-72 bg-primary/10 blur-3xl" />
          <div className="absolute rounded-full -bottom-24 -left-24 h-72 w-72 bg-primary/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-[360px]">
          {/* Brand (mobile only) */}
          <div className="mb-7 flex items-center gap-2.5 animate-fade-up lg:hidden">
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
              Masuk ke akun
            </h1>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              Selamat datang kembali di Quick Order.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={submit}
            className="mt-7 space-y-3.5 animate-fade-up [animation-delay:120ms]"
            data-testid="login-form"
          >
            {/* Username */}
            <div>
              <Label
                htmlFor="username"
                className="text-[12.5px] font-medium text-foreground/80"
              >
                Username
              </Label>
              <div className="group relative mt-1.5 h-10 w-full">
                {/* Leading icon container */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 z-10 flex items-center justify-center w-10 transition-colors pointer-events-none text-muted-foreground/70 group-focus-within:text-primary"
                >
                  <User className="w-4 h-4" />
                </span>

                <Input
                  id="username"
                  data-testid="login-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="h-10 w-full rounded-lg pl-10 pr-3 text-[13.5px] transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label
                htmlFor="password"
                className="text-[12.5px] font-medium text-foreground/80"
              >
                Password
              </Label>
              <div className="group relative mt-1.5 h-10 w-full">
                {/* Leading icon container */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 z-10 flex items-center justify-center w-10 transition-colors pointer-events-none text-muted-foreground/70 group-focus-within:text-primary"
                >
                  <Lock className="w-4 h-4" />
                </span>

                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg pl-10 pr-10 text-[13.5px] transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
                />

                {/* Trailing icon button container */}
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-0 z-10 flex items-center justify-center w-10 transition-colors text-muted-foreground/70 hover:text-foreground"
                  aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <span className="flex items-center justify-center transition-colors rounded-md h-7 w-7 hover:bg-secondary">
                    {show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
                data-testid="login-remember-checkbox"
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-[12.5px] font-normal text-muted-foreground transition-colors hover:text-foreground"
              >
                Remember me
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="group relative h-10 w-full rounded-lg text-[14px] font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Masuk
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-5 text-center text-[13px] text-muted-foreground animate-fade-up [animation-delay:180ms]">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              data-testid="go-register-link"
            >
              Daftar sekarang
            </Link>
          </p>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground/80 animate-fade-up [animation-delay:240ms]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Login aman & terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Left - Hero */}
      <div className="relative order-1 hidden overflow-hidden lg:block lg:order-2">
        <img
          src={HERO}
          alt=""
          className="h-full w-full scale-105 object-cover animate-[fadeIn_1.2s_ease-out]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/50 to-green-950/20" />

        {/* Floating glass content */}
        <div className="absolute inset-0 flex items-end p-10 xl:p-14">
          <div className="w-full max-w-md animate-fade-up [animation-delay:300ms]">
            {/* Brand chip */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-md">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/15">
                <Zap className="w-3 h-3" strokeWidth={2.5} />
              </span>
              Quick Order
            </div>

            <h2 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-white xl:text-[32px]">
              Virtual Number cepat, aman & terpercaya.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Aktivasi instan dengan pembayaran manual mudah. Tersedia untuk
              berbagai negara.
            </p>

            {/* Country chips */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              {["Japan", "Canada", "Indonesia"].map((c, i) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-white/85 backdrop-blur-md animate-fade-up"
                  style={{ animationDelay: `${380 + i * 60}ms` }}
                >
                  <Globe2 className="w-3 h-3" />
                  {c}
                </span>
              ))}
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Proses", value: "Instan" },
                { label: "Pembayaran", value: "Manual" },
                { label: "Support", value: "24/7" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md animate-fade-up"
                  style={{ animationDelay: `${560 + i * 60}ms` }}
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