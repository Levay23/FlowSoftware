import { useState } from "react";
import { useGetMe, useChangePassword, useDisconnectWhatsapp, getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Lock, Smartphone, Save, 
  CheckCircle, Settings as SettingsIcon,
  LogOut, Shield, ShieldCheck, Zap,
  Database, Activity
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const changePasswordMutation = useChangePassword({
    mutation: {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSaved(true);
        setTimeout(() => setPasswordSaved(false), 3000);
      },
      onError: () => {
        setPasswordError("Contraseña actual incorrecta");
      },
    },
  });

  const disconnectMutation = useDisconnectWhatsapp({
    mutation: {
      onSuccess: () => {
        alert("WhatsApp desconectado exitosamente");
      },
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    changePasswordMutation.mutate({ data: { currentPassword, newPassword } });
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <SettingsIcon className="w-3 h-3" />
              Ajustes de Perfil
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">
              Mi <span className="gradient-cyber">Cuenta</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Administra tu perfil y opciones de seguridad.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl">
            <div className="text-right">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Estado API</div>
              <div className="text-sm font-black text-primary leading-none mt-1">ESTABLE</div>
            </div>
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            {/* Profile info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <User className="w-40 h-40" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Información Personal</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Detalles de tu cuenta</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 mb-10 p-6 bg-white/2 rounded-3xl border border-white/5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                    <span className="text-4xl font-black text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-black border border-primary/50 flex items-center justify-center shadow-lg">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <div className="text-2xl font-black text-foreground uppercase tracking-tight">{user?.name}</div>
                  <div className="text-xs font-mono text-muted-foreground opacity-60 tracking-wider">{user?.email}</div>
                  <div className="pt-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${user?.role === "admin" ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                      ROL: {user?.role === "admin" ? "ADMINISTRADOR" : "USUARIO"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-foreground/50 cursor-not-allowed font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-foreground/50 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Nota: Para cambiar tus datos de perfil, contacta con soporte técnico.</p>
              </div>
            </motion.div>

            {/* Change password */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-premium p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Seguridad de la Cuenta</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Actualizar contraseña</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contraseña Actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                    required
                  />
                </div>

                <AnimatePresence>
                  {passwordError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 uppercase tracking-widest">
                      ERROR: {passwordError}
                    </motion.div>
                  )}
                  {passwordSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      CONTRASEÑA ACTUALIZADA CON ÉXITO
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center gap-3 px-8 py-4 bg-purple-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  {changePasswordMutation.isPending ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* WhatsApp */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-premium p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Conexión WhatsApp</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Estado del enlace</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 mb-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Desvincular tu cuenta invalidará la sesión de WhatsApp activa. Deberás re-escanear el código QR para restaurar el servicio.
                </p>
              </div>

              <button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-destructive/20 transition-all disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                {disconnectMutation.isPending ? "Desconectando..." : "Desvincular WhatsApp"}
              </button>
            </motion.div>

            {/* Danger zone */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/20 relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LogOut className="w-24 h-24" />
              </div>
              <h2 className="text-xs font-black text-destructive uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                ZONA PELIGROSA
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed mb-6 opacity-60">
                Al cerrar sesión se eliminarán los tokens de acceso y deberás volver a ingresar tus credenciales.
              </p>
              <button
                onClick={logout}
                className="w-full py-4 bg-destructive text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-destructive/90 transition-all shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]"
              >
                Cerrar Sesión Ahora
              </button>
            </motion.div>

            {/* System Info */}
            <div className="px-8 py-6 rounded-[2.5rem] glass border-white/5 flex items-center gap-4">
              <Database className="w-5 h-5 text-muted-foreground opacity-30" />
              <div>
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Versión v4.2.0-stable</div>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">Estado del Sistema: 100% Operativo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
