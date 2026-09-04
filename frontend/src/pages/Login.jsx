import { useState } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const HERO = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbnxlbnwwfHx8fDE3ODc4MjIxOTJ8MA&ixlib=rb-4.1.0&q=85";

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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={HERO} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Zap className="h-6 w-6" />
            </span>
            <span className="font-heading text-2xl font-bold">Quick Order</span>
          </div>
          <h2 className="font-heading text-3xl font-bold leading-tight">Virtual Number cepat, aman & terpercaya.</h2>
          <p className="mt-3 max-w-md text-white/80">Japan, Canada, Indonesia — aktivasi instan dengan pembayaran manual mudah.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold">Masuk ke akun</h1>
          <p className="mt-2 text-muted-foreground">Selamat datang kembali di Quick Order.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="login-form">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="login-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-muted-foreground">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} data-testid="login-remember-checkbox" />
              <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-muted-foreground">Remember me</Label>
            </div>
            <Button type="submit" disabled={loading} data-testid="login-submit-btn" className="h-11 w-full rounded-full text-base">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline" data-testid="go-register-link">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
