import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Trash2, Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import api, { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [newPass, setNewPass] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => setUsers([]));
  useEffect(() => { load(); }, []);

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
    if (newPass.length < 8) { toast.error("Password minimal 8 karakter"); return; }
    setBusy(true);
    try {
      await api.post(`/admin/users/${resetUser.id}/reset-password`, { new_password: newPass });
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
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-muted-foreground">Kelola pengguna terdaftar.</p>

      {users === null ? (
        <Skeleton className="mt-8 h-96 rounded-2xl" />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm" data-testid="admin-users-table">
            <thead className="bg-secondary/40 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Nomor</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border" data-testid={`user-row-${u.username}`}>
                  <td className="px-5 py-3 font-medium">{u.username}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">{u.phone}</td>
                  <td className="px-5 py-3">
                    <Select value={u.role} onValueChange={(v) => update(u.id, { role: v })} disabled={u.role === "admin"}>
                      <SelectTrigger className="h-8 w-28" data-testid={`user-role-${u.username}`}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="user">user</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={`rounded-full ${u.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"}`}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {u.role !== "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title={u.status === "active" ? "Suspend" : "Aktifkan"} onClick={() => update(u.id, { status: u.status === "active" ? "suspended" : "active" })} data-testid={`user-suspend-${u.username}`}>
                          {u.status === "active" ? <ShieldOff className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Reset password" onClick={() => { setResetUser(u); setNewPass(""); }} data-testid={`user-reset-${u.username}`}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {u.role !== "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" title="Hapus" onClick={() => setDeleteUser(u)} data-testid={`user-delete-${u.username}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password — {resetUser?.username}</DialogTitle></DialogHeader>
          <div>
            <Label>Password Baru</Label>
            <Input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="mt-1.5" placeholder="Minimal 8 karakter" data-testid="reset-password-input" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setResetUser(null)}>Batal</Button>
            <Button onClick={doReset} disabled={busy} className="rounded-full" data-testid="confirm-reset-password-btn">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus user {deleteUser?.username}?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="rounded-full bg-destructive hover:bg-destructive/90" data-testid="confirm-delete-user-btn">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
