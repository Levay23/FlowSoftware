import { useState } from "react";
import { useGetMe, useChangePassword, useDisconnectWhatsapp, getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { User, Lock, Smartphone, Save, CheckCircle } from "lucide-react";

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
        setPasswordError("Contrasena actual incorrecta");
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
      setPasswordError("Las contrasenas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    changePasswordMutation.mutate({ data: { currentPassword, newPassword } });
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Configuracion</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona tu perfil y configuracion de cuenta</p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          {/* Profile info */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Informacion de Perfil</h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mb-5 p-4 bg-muted/30 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">{user?.name}</div>
                <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre</label>
                <input
                  data-testid="input-profile-name"
                  type="text"
                  defaultValue={user?.name}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                <input
                  data-testid="input-profile-email"
                  type="email"
                  defaultValue={user?.email}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                data-testid="btn-save-profile"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all glow-green-sm"
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Cambiar Contrasena</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Contrasena actual</label>
                <input
                  data-testid="input-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nueva contrasena</label>
                <input
                  data-testid="input-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Confirmar nueva contrasena</label>
                <input
                  data-testid="input-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {passwordError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {passwordError}
                </div>
              )}

              {passwordSaved && (
                <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Contrasena cambiada exitosamente
                </div>
              )}

              <button
                data-testid="btn-change-password"
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {changePasswordMutation.isPending ? "Cambiando..." : "Cambiar contrasena"}
              </button>
            </form>
          </div>

          {/* WhatsApp */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Smartphone className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Sesion WhatsApp</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Cierra la sesion de WhatsApp en este dispositivo. Tendras que volver a escanear el QR para reconectar.
            </p>

            <button
              data-testid="btn-logout-whatsapp"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-all disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4" />
              {disconnectMutation.isPending ? "Cerrando..." : "Cerrar sesion de WhatsApp"}
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 sm:p-6">
            <h2 className="font-semibold text-sm text-destructive mb-3">Zona de Peligro</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Cerrar sesion eliminara tu token de acceso local. Tendras que iniciar sesion de nuevo.
            </p>
            <button
              data-testid="btn-sign-out"
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-all"
            >
              Cerrar sesion completa
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
