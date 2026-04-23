import { Link } from "wouter";
import { ShieldCheck, Zap, Fingerprint, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            <Lock className="w-3 h-3 text-primary" />
            Solicitud de Cuenta Real
          </div>
        </div>

        <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Fingerprint className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <div className="flex gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Acceso Privado</h2>
                <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-widest opacity-60">
                  Por seguridad, el registro público está desactivado. Las cuentas son creadas manualmente por la administración tras la verificación de los servicios contratados.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-green shadow-[0_15px_30px_-10px_rgba(0,255,136,0.3)]"
              >
                Ingresar a mi Cuenta
              </Link>
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-3 py-4 glass border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-foreground hover:bg-white/5 hover:border-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Inicio
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] text-muted-foreground mb-4 uppercase tracking-[0.2em] opacity-40">
              ¿Ya tiene una cuenta activa?
            </p>
            <Link href="/login" className="text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-125 transition-all">
              Ingresar al Panel
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
