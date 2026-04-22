import { Link } from "wouter";
import { ShieldCheck, Zap } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 mb-4 glow-green">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cuenta real</h1>
          <p className="text-muted-foreground text-sm mt-1">Las cuentas reales son activadas despues de la suscripcion</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-border">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Registro privado</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Por seguridad, el registro publico esta desactivado. Cuando un cliente compra la suscripcion,
                el administrador crea su cuenta real y entrega sus credenciales de acceso.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              href="/login"
              className="w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all glow-green-sm"
            >
              Ingresar con cuenta real
            </Link>
            <Link
              href="/"
              className="w-full text-center border border-border hover:border-primary/50 text-foreground font-semibold py-3 rounded-lg transition-all"
            >
              Volver al inicio
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span>Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
