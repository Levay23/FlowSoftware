import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Copy, Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

import { customFetch } from "@workspace/api-client-react";

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

type CreatedAccount = {
  email: string;
  password: string;
  name: string;
};

export default function AdminUsers() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!token || user?.role !== "admin") return;

      setLoading(true);
      setError("");

      try {
        const data = await customFetch<AdminUser[]>("/api/admin/users");
        setUsers(data);
      } catch (err) {
        const e = err as { data?: { error?: string }; message?: string };
        setError(e?.data?.error || e?.message || "Error cargando cuentas");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token, user?.role]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");
    setCreatedAccount(null);

    try {
      const data = await customFetch<{ user: AdminUser; temporaryPassword?: string }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          role,
        }),
      });

      setUsers((current) => [...current, data.user]);
      setCreatedAccount({
        email: data.user.email,
        name: data.user.name,
        password: data.temporaryPassword || "******",
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err) {
      const e = err as { data?: { error?: string }; message?: string };
      setError(e?.data?.error || e?.message || "Error creando cuenta");
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = async () => {
    if (!createdAccount) return;

    await navigator.clipboard.writeText(
      `Nombre: ${createdAccount.name}\nEmail: ${createdAccount.email}\nContrasena: ${createdAccount.password}`,
    );
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Administracion</h1>
              <p className="text-muted-foreground text-sm mt-1">Crea cuentas reales para clientes con suscripcion activa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <UserPlus className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Crear cuenta real</h2>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre del cliente</label>
                <input
                  data-testid="input-admin-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="Nombre o empresa"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Correo del cliente</label>
                <input
                  data-testid="input-admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="cliente@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Contrasena inicial</label>
                <input
                  data-testid="input-admin-password"
                  type="text"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="Dejala vacia para generar una"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de cuenta</label>
                <select
                  data-testid="select-admin-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                >
                  <option value="user">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                data-testid="btn-admin-create-user"
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {saving ? "Creando cuenta..." : "Crear cuenta real"}
              </button>
            </form>

            {createdAccount && (
              <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-4">
                <div className="text-sm font-semibold text-primary mb-2">Credenciales creadas</div>
                <div className="space-y-1 text-sm text-foreground">
                  <div>Nombre: {createdAccount.name}</div>
                  <div>Email: {createdAccount.email}</div>
                  <div>Contrasena: {createdAccount.password}</div>
                </div>
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar credenciales
                </button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm text-foreground">Cuentas existentes</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{users.length} cuentas</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando cuentas...
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Nombre</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Rol</th>
                        <th className="pb-3 font-medium">Alta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((account) => (
                        <tr key={account.id} className="border-b border-border/60">
                          <td className="py-3 text-foreground">{account.name}</td>
                          <td className="py-3 text-muted-foreground">{account.email}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${account.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                              {account.role === "admin" ? "Administrador" : "Cliente"}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{new Date(account.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-border">
                  {users.map((account) => (
                    <div key={account.id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{account.name}</div>
                          <div className="text-xs text-muted-foreground truncate mt-1">{account.email}</div>
                          <div className="text-xs text-muted-foreground mt-2">{new Date(account.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${account.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                          {account.role === "admin" ? "Admin" : "Cliente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}