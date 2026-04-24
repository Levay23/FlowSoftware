import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  Copy, Loader2, ShieldCheck, UserPlus, 
  Users, Edit2, Trash2, Snowflake, 
  Play, X, Save, Zap, Fingerprint,
  Activity, Key
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useAdminListUsers, 
  useAdminCreateUser, 
  useAdminUpdateUser, 
  useAdminDeleteUser 
} from "@workspace/api-client-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [createdAccount, setCreatedAccount] = useState<{ email: string; password?: string; name: string } | null>(null);

  // Edit State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const { data: users = [], isLoading, refetch } = useAdminListUsers();
  const createUserMutation = useAdminCreateUser();
  const updateUserMutation = useAdminUpdateUser();
  const deleteUserMutation = useAdminDeleteUser();

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "moderator") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreatedAccount(null);
    createUserMutation.mutate(
      { data: { name, email, password: password || undefined, role: role as "admin" | "user" } },
      {
        onSuccess: (data) => {
          setCreatedAccount({
            email: data.user.email,
            name: data.user.name,
            password: data.temporaryPassword,
          });
          setName("");
          setEmail("");
          setPassword("");
          setRole("user");
          refetch();
        },
        onError: (err: any) => {
          alert(err?.data?.error || err?.message || "Error creando cuenta");
        }
      }
    );
  };

  const handleUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate(
      { 
        id: editingUser.id, 
        data: {
          name: editName,
          email: editEmail,
          role: editRole as "admin" | "user",
          status: editStatus as "active" | "suspended",
          password: editPassword || undefined,
        } 
      },
      {
        onSuccess: () => {
          setEditingUser(null);
          setEditPassword("");
          refetch();
        },
        onError: (err: any) => {
          alert(err?.data?.error || err?.message || "Error actualizando cuenta");
        }
      }
    );
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta cuenta? Esta acción no se puede deshacer.")) return;
    deleteUserMutation.mutate(
      { id },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (err: any) => {
          alert(err?.data?.error || err?.message || "Error eliminando cuenta");
        }
      }
    );
  };

  const handleToggleStatus = (account: any) => {
    const newStatus = account.status === "active" ? "suspended" : "active";
    updateUserMutation.mutate(
      { id: account.id, data: { status: newStatus } },
      { onSuccess: () => refetch() }
    );
  };

  const startEdit = (account: any) => {
    setEditingUser(account);
    setEditName(account.name);
    setEditEmail(account.email);
    setEditRole(account.role);
    setEditStatus(account.status);
    setEditPassword("");
  };

  const copyCredentials = async () => {
    if (!createdAccount) return;
    await navigator.clipboard.writeText(`Nombre: ${createdAccount.name}\nEmail: ${createdAccount.email}\nContraseña: ${createdAccount.password}`);
    alert("Credenciales copiadas al portapapeles");
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Control Administrativo
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
              Gestión de <span className="gradient-cyber">Usuarios</span>
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-60">Administra el acceso y roles de la plataforma.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl">
            <div className="text-right">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Usuarios</div>
              <div className="text-sm font-black text-primary leading-none mt-1">{users.length} CUENTAS</div>
            </div>
            <Users className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Create Account Card */}
            <div className="glass-premium p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Fingerprint className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Crear Cuenta</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Configurar nuevo acceso</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                    placeholder="Ej: Juan Perez"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                    placeholder="usuario@flowsoftware.app"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contraseña Inicial</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                    placeholder="Dejar vacío para aleatoria"
                  />
                </div>

                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nivel de Acceso</label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all uppercase font-black tracking-tighter appearance-none"
                    style={{ backgroundColor: '#0c0c0c' }}
                  >
                    <option value="user" style={{ backgroundColor: '#0c0c0c' }}>Usuario Estándar</option>
                    {user?.role === "admin" && (
                      <>
                        <option value="moderator" style={{ backgroundColor: '#0c0c0c' }}>Moderador</option>
                        <option value="admin" style={{ backgroundColor: '#0c0c0c' }}>Administrador</option>
                      </>
                    )}
                  </select>


                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                >
                  {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Crear Cuenta
                </button>
              </form>

              <AnimatePresence>
                {createdAccount && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="mt-6 p-5 rounded-2xl border border-primary/20 bg-primary/5"
                  >
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Key className="w-3.5 h-3.5" />
                      Usuario Creado Exitosamente
                    </div>
                    {user?.role === "moderator" && (
                      <p className="text-[9px] text-yellow-500 font-bold uppercase mb-3">Pendiente de aprobación por el administrador</p>
                    )}
                    <div className="space-y-2 text-[11px] font-mono text-foreground opacity-80">
                      <div>NOMBRE: {createdAccount.name}</div>
                      <div>EMAIL: {createdAccount.email}</div>
                      {createdAccount.password && (
                        <div className="text-primary font-black bg-primary/10 px-2 py-1 rounded-lg inline-block">PASS: {createdAccount.password}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={copyCredentials}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/30 text-[10px] font-black uppercase text-primary hover:bg-primary/10 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Credenciales
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pending Approvals Table (Admin Only) */}
          <AnimatePresence>
            {users.filter(u => u.status === 'pending_approval').length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className="glass-premium overflow-hidden mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-yellow-500/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Solicitudes Pendientes</h2>
                  </div>
                  <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] bg-yellow-500/10 px-3 py-1 rounded-full">
                    {users.filter(u => u.status === 'pending_approval').length} POR APROBAR
                  </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-left">
                        <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nombre</th>
                        <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acceso Solicitado</th>
                        <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estado</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.filter(account => account.status === 'pending_approval').map((account, idx) => (
                        <motion.tr 
                          key={account.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-white/5 transition-all bg-yellow-500/5"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-foreground group-hover:text-yellow-500 transition-colors">{account.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">{account.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                              account.role === "admin" ? "bg-destructive/10 border-destructive/30 text-destructive" : 
                              account.role === "moderator" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                              "bg-primary/10 border-primary/30 text-primary"
                            }`}>
                              {account.role === "admin" ? "ADMIN" : account.role === "moderator" ? "MOD" : "USER"}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] bg-yellow-500 text-yellow-500 animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">
                                En Espera
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user?.role === "admin" && (
                                <button
                                  onClick={() => updateUserMutation.mutate({ id: account.id, data: { status: 'active' } }, { onSuccess: () => refetch() })}
                                  className="w-auto px-4 h-9 flex items-center justify-center gap-2 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                                  title="Aprobar Usuario"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  Aprobar
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(account)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(account.id)}
                                disabled={user?.role === "moderator"}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User List Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-premium overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Usuarios Registrados</h2>
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{users.filter(u => u.status !== 'pending_approval').length} ACTIVOS / SUSPENDIDOS</div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nombre</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acceso</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {isLoading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-8 py-6"><div className="h-8 bg-white/5 rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : (
                      users.filter(account => account.status !== 'pending_approval').map((account, idx) => (
                        <motion.tr 
                          key={account.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group hover:bg-white/5 transition-all ${account.status === 'suspended' ? 'opacity-40 grayscale' : ''}`}
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{account.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">{account.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                              account.role === "admin" ? "bg-destructive/10 border-destructive/30 text-destructive" : 
                              account.role === "moderator" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                              "bg-primary/10 border-primary/30 text-primary"
                            }`}>
                              {account.role === "admin" ? "ADMIN" : account.role === "moderator" ? "MOD" : "USER"}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                                account.status === "active" ? "bg-primary text-primary" : 
                                "bg-destructive text-destructive"
                              }`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${
                                account.status === "active" ? "text-primary" : 
                                "text-destructive"
                              }`}>
                                {account.status === "active" ? "Activo" : "Suspendido"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(account)}
                                disabled={user?.role === "moderator"}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${account.status === 'active' ? 'border-white/5 text-muted-foreground hover:text-destructive' : 'bg-primary border-primary text-black'} disabled:opacity-30`}
                              >
                                {account.status === 'active' ? < Snowflake className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                              </button>
                              <button
                                onClick={() => startEdit(account)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(account.id)}
                                disabled={account.email === "admin@flowsoftware.app" || user?.role === "moderator"}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium p-10 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Edit2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Editar Cuenta</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Usuario: {editingUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setEditingUser(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-foreground transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nivel Privilegio</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/50 uppercase font-black tracking-widest"
                      style={{ backgroundColor: '#0c0c0c' }}
                      disabled={user?.role === "moderator"}
                    >
                      <option value="user" style={{ backgroundColor: '#0c0c0c' }}>Usuario Estándar</option>
                      <option value="moderator" style={{ backgroundColor: '#0c0c0c' }}>Moderador</option>
                      <option value="admin" style={{ backgroundColor: '#0c0c0c' }}>Administrador</option>
                    </select>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estado de Cuenta</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/50 uppercase font-black tracking-widest"
                      style={{ backgroundColor: '#0c0c0c' }}
                      disabled={user?.role === "moderator"}
                    >
                      <option value="active" style={{ backgroundColor: '#0c0c0c' }}>Activo</option>
                      <option value="pending_approval" style={{ backgroundColor: '#0c0c0c' }}>Pendiente de Aprobación</option>
                      <option value="suspended" style={{ backgroundColor: '#0c0c0c' }}>Suspendido</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cambiar Contraseña (Opcional)</label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                    placeholder="En blanco para mantener actual"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-4 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all glow-green shadow-[0_0_15px_rgba(0,255,136,0.2)] disabled:opacity-50"
                  >
                    {updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}