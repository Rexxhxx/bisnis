import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
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

  const rows = [
    { icon: User, label: "Username", value: user?.username },
    { icon: User, label: "Nama Lengkap", value: user?.full_name },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Phone, label: "Nomor Pengguna", value: user?.phone },
    { icon: Shield, label: "Role", value: user?.role },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-bold tracking-tight">Profile</h1>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" data-testid="profile-card">
        <div className="flex items-center gap-4 border-b border-border bg-secondary/40 px-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(user?.full_name || user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-xl font-bold">{user?.full_name || user?.username}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-4 px-6 py-4">
              <r.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{r.label}</p>
                <p className="font-medium capitalize">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleLogout} variant="outline" className="mt-6 w-full rounded-full text-destructive hover:bg-destructive/10" data-testid="profile-logout-btn">
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
}
