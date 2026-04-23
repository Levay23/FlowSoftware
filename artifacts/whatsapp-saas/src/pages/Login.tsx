import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, EyeOff, ShieldCheck, Fingerprint, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
// import SplineScene from "@/components/SplineScene";

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
        login(data.token, data.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
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
      const data = await customFetch<{ token: string; user: any }>("/api/auth/demo", { method: "POST" });
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
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Futuristic Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none z-1">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background opacity-90" />
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Logo size="lg" className="mb-4" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]"
          >
            <ShieldCheck className="w-3 h-3 text-primary" />
            Acceso Seguro de Usuarios
          </motion.div>
        </div>

        <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Fingerprint className="w-40 h-40" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-foreground placeholder-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-mono"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contraseña de Acceso</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-foreground placeholder-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-mono pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 uppercase tracking-widest"
                >
                  ERROR DE ACCESO: {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-green shadow-[0_15px_30px_-10px_rgba(0,255,136,0.3)] disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/register" className="text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-125 transition-all flex items-center justify-center gap-2 group">
              Solicitar una Cuenta Real
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-muted-foreground mb-4 uppercase tracking-[0.2em] opacity-40">
              ¿Desea probar la plataforma?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase text-foreground hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {demoLoading ? "Abriendo..." : "Ingresar a Cuenta Demo"}
            </motion.button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors opacity-40 hover:opacity-100">
            Volver al Inicio
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
