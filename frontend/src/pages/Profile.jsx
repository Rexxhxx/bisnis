import { User, Mail, Phone, Shield, LogOut, AtSign, BadgeCheck, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || user?.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const rows = [
    { icon: User, label: "Username", value: user?.username },
    { icon: User, label: "Nama Lengkap", value: user?.full_name },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Phone, label: "Nomor Pengguna", value: user?.phone },
    { icon: Shield, label: "Role", value: user?.role },
  ];

  return (
    <div className="max-w-xl px-4 py-10 mx-auto sm:px-6 lg:py-12">
      {/* Header */}
      <div className="mb-7 animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <Settings2 className="h-3.5 w-3.5" />
          <span>Pengaturan akun Anda</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Profil Saya
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Kelola informasi akun dan keamanan Anda.
        </p>
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm animate-fade-up [animation-delay:60ms]"
        data-testid="profile-card"
      >
        {/* Card header */}
        <div className="relative flex items-center gap-4 px-5 py-5 border-b border-border/70 bg-secondary/40 sm:px-6">
          {/* subtle glow */}
          <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-10 bg-primary/10 blur-3xl" />

          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-[20px] font-bold text-primary-foreground shadow-sm ring-4 ring-primary/10">
            {initial}
          </div>
          <div className="relative min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-heading text-[16px] font-semibold tracking-tight truncate">
                {displayName}
              </p>
              <BadgeCheck className="w-4 h-4 shrink-0 text-primary" />
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] text-muted-foreground">
              <AtSign className="w-3 h-3" />
              {user?.username}
            </p>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/70">
          {rows.map((r, idx) => (
            <Row
              key={r.label}
              icon={r.icon}
              label={r.label}
              value={r.value}
              delay={120 + idx * 50}
            />
          ))}
        </div>
      </div>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="group mt-5 w-full h-10 rounded-lg text-[13px] font-medium text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 transition-all animate-fade-up [animation-delay:400ms]"
        data-testid="profile-logout-btn"
      >
        <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Logout
      </Button>

      {/* Footer hint */}
      <p className="mt-5 text-center text-[11.5px] text-muted-foreground/70 animate-fade-up [animation-delay:460ms]">
        Pastikan informasi akun Anda selalu up-to-date
      </p>
    </div>
  );
}

/* ---------- Row ---------- */
function Row({ icon: Icon, label, value, delay = 0 }) {
  return (
    <div
      className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-secondary/30 sm:px-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center transition-colors rounded-lg h-9 w-9 shrink-0 bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60 group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
          {label}
        </p>
        <p className="mt-0.5 text-[13.5px] font-medium capitalize truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}