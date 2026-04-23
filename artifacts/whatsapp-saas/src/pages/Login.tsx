import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        console.log("Login success!", data);
        login(data.token, data.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        console.error("Login error:", err);
        const msg = err?.data?.error || err?.message || "No se pudo conectar con el servidor.";
        setError(msg);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } });
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError("");

    try {
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL.replace(/\/$/, "");
      console.log("Starting demo session via:", apiBase);
      const response = await fetch(`${apiBase}/api/auth/demo`, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo iniciar el demo");
      }

      login(data.token, data.user);
      setLocation("/dashboard");
    } catch {
      setError("No se pudo iniciar el demo. Intenta de nuevo.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <p className="text-muted-foreground text-sm mt-1">Inicia sesion en tu panel</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Correo electronico</label>
              <input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contrasena</label>
              <div className="relative">
                <input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              data-testid="btn-submit"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all glow-green-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span>No tienes cuenta? </span>
            <Link href="/register" className="text-primary hover:underline font-medium">
              Solicita una cuenta real
            </Link>
          </div>

          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-3">
              El demo dura 30 minutos, empieza vacio y se desconecta automaticamente al terminar.
            </p>
            <button
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
            >
              {demoLoading ? "Preparando demo..." : "Ingresar al demo"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Volver a la pagina principal
          </Link>
        </div>
      </div>
    </div>
  );
}
