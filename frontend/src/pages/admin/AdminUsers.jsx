import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Trash2,
  Loader2,
  ShieldOff,
  ShieldCheck,
  Users as UsersIcon,
  User,
  Mail,
  Phone,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [newPass, setNewPass] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]));

  useEffect(() => {
    load();
  }, []);

  const update = async (id, patch) => {
    try {
      await api.put(`/admin/users/${id}`, patch);
      toast.success("User diperbarui");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const doReset = async () => {
    if (newPass.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/admin/users/${resetUser.id}/reset-password`, {
        new_password: newPass,
      });
      toast.success("Password direset");
      setResetUser(null);
      setNewPass("");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteUser.id}`);
      toast.success("User dihapus");
      setDeleteUser(null);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <UsersIcon className="h-3.5 w-3.5" />
          <span>Kelola pengguna terdaftar</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Users
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Atur role, status, dan kredensial pengguna.
        </p>
      </div>

      {/* ---------- Table ---------- */}
      {users === null ? (
        <Skeleton className="h-[420px] rounded-xl animate-fade-up [animation-delay:60ms]" />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm animate-fade-up [animation-delay:60ms]">
          <div className="overflow-x-auto">
            <table
              className="w-full text-[12.5px]"
              data-testid="admin-users-table"
            >
              <thead className="text-left bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Username</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Nomor</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onUpdate={update}
                    onReset={() => {
                      setResetUser(u);
                      setNewPass("");
                    }}
                    onDelete={() => setDeleteUser(u)}
                    delay={100 + i * 30}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- Reset Password Dialog ---------- */}
      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg h-9 w-9 bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                <KeyRound className="w-4 h-4" />
              </span>
              <div>
                <DialogTitle className="font-heading text-[15px] font-semibold tracking-tight">
                  Reset Password
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  Untuk user{" "}
                  <span className="font-medium text-foreground/80">
                    {resetUser?.username}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-1">
            <Label
              htmlFor="new-pass"
              className="text-[12.5px] font-medium text-foreground/80"
            >
              Password Baru
            </Label>
            <Input
              id="new-pass"
              type="text"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="mt-1.5 h-9 rounded-lg text-[13px]"
              placeholder="Minimal 8 karakter"
              data-testid="reset-password-input"
            />
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              Password akan langsung aktif setelah direset.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-[13px]"
              onClick={() => setResetUser(null)}
            >
              Batal
            </Button>
            <Button
              onClick={doReset}
              disabled={busy}
              size="sm"
              className="h-9 rounded-lg text-[13px] font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              data-testid="confirm-reset-password-btn"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete Dialog ---------- */}
      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(o) => !o && setDeleteUser(null)}
      >
        <AlertDialogContent className="max-w-md rounded-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg h-9 w-9 bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div>
                <AlertDialogTitle className="font-heading text-[15px] font-semibold tracking-tight">
                  Hapus user ini?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  User{" "}
                  <span className="font-medium text-foreground/80">
                    {deleteUser?.username}
                  </span>{" "}
                  akan dihapus permanen.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0 h-9 rounded-lg text-[13px] sm:mt-0">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="h-9 rounded-lg bg-destructive text-[13px] font-medium hover:bg-destructive/90"
              data-testid="confirm-delete-user-btn"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- User Row ---------- */
function UserRow({ user: u, onUpdate, onReset, onDelete, delay = 0 }) {
  const isAdmin = u.role === "admin";
  const isActive = u.status === "active";

  return (
    <tr
      className="transition-colors border-t border-border/60 hover:bg-secondary/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      data-testid={`user-row-${u.username}`}
    >
      {/* Username */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60 text-[11px] font-semibold">
            {u.username?.charAt(0).toUpperCase() || "?"}
          </span>
          <span className="font-medium">{u.username}</span>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-2.5 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 shrink-0 text-muted-foreground/60" />
          <span className="truncate max-w-[180px]">{u.email}</span>
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
        {u.phone || "-"}
      </td>

      {/* Role */}
      <td className="px-4 py-2.5">
        <Select
          value={u.role}
          onValueChange={(v) => onUpdate(u.id, { role: v })}
          disabled={isAdmin}
        >
          <SelectTrigger
            className="h-8 w-24 rounded-lg text-[12px]"
            data-testid={`user-role-${u.username}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">user</SelectItem>
            <SelectItem value="admin">admin</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <Badge
          className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
            isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10 ring-1 ring-inset ring-red-500/20"
          }`}
        >
          {isActive ? "Active" : "Suspended"}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-1">
          {!isAdmin && (
            <IconButton
              title={isActive ? "Suspend" : "Aktifkan"}
              onClick={() =>
                onUpdate(u.id, {
                  status: isActive ? "suspended" : "active",
                })
              }
              testId={`user-suspend-${u.username}`}
              tone={isActive ? "warning" : "success"}
            >
              {isActive ? (
                <ShieldOff className="h-3.5 w-3.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
            </IconButton>
          )}

          <IconButton
            title="Reset password"
            onClick={onReset}
            testId={`user-reset-${u.username}`}
            tone="primary"
          >
            <KeyRound className="h-3.5 w-3.5" />
          </IconButton>

          {!isAdmin && (
            <IconButton
              title="Hapus user"
              onClick={onDelete}
              testId={`user-delete-${u.username}`}
              tone="danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------- Icon Button ---------- */
function IconButton({ children, title, onClick, testId, tone = "default" }) {
  const tones = {
    default:
      "text-muted-foreground hover:bg-secondary hover:text-foreground",
    primary: "text-muted-foreground hover:bg-primary/10 hover:text-primary",
    warning:
      "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
    success:
      "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
    danger: "text-destructive hover:bg-destructive/10",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-all ${tones[tone]}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

/* ---------- Empty State ---------- */
function EmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden text-center border border-dashed rounded-2xl border-border bg-card animate-fade-up">
      <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full pointer-events-none -top-20 left-1/2 bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
        <UsersIcon className="w-6 h-6" />
      </div>

      <h3 className="relative mt-4 font-heading text-[16px] font-semibold tracking-tight">
        Belum ada user terdaftar
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[12.5px] text-muted-foreground">
        Pengguna akan muncul di sini setelah mereka melakukan registrasi.
      </p>
    </div>
  );
}