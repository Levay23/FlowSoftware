import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Zap, Users, TrendingUp, ArrowRight,
  Smartphone, Brain, Clock,
  MessageCircle, Shield, Globe,
  Activity, Layers, Cpu
} from "lucide-react";
import Logo from "@/components/Logo";
import { customFetch } from "@workspace/api-client-react";
// import SplineScene from "@/components/SplineScene";

const BENEFITS = [
  { icon: Clock, title: "Atención 24/7", desc: "Tu asistente virtual responde al instante, calificando clientes y cerrando ventas mientras tú descansas." },
  { icon: Brain, title: "Inteligencia de Negocio", desc: "IA entrenada específicamente con la información de tu empresa para respuestas precisas y profesionales." },
  { icon: MessageCircle, title: "Control en Vivo", desc: "Interfaz intuitiva para supervisar y tomar el control de las conversaciones cuando sea necesario." },
  { icon: Users, title: "Gestión de Contactos", desc: "CRM integrado que organiza y segmenta tus contactos de WhatsApp automáticamente." },
];

const STATS = [
  { value: "99.9%", label: "Disponibilidad", color: "text-primary" },
  { value: "24/7", label: "Operación", color: "text-cyan-400" },
  { value: "< 1s", label: "Respuesta", color: "text-purple-400" },
  { value: "SSL", label: "Seguridad", color: "text-primary" },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const enterDemo = async () => {
    setDemoLoading(true);
    try {
      const data = await customFetch<{ token: string; user: any }>("/api/auth/demo", { method: "POST" });
      login(data.token, data.user);
      setLocation("/dashboard");
    } catch {
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.05),transparent_50%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4" : "py-8"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`glass-premium rounded-2xl p-4 flex items-center justify-between border-white/5 transition-all ${scrolled ? "bg-black/60 shadow-2xl" : "bg-transparent"}`}>
            <div className="flex items-center gap-10">
              <Logo size="md" />
              <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <a href="#beneficios" className="hover:text-primary transition-colors">Servicios</a>
                <a href="#como-funciona" className="hover:text-primary transition-colors">Funcionamiento</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all hidden sm:block">
                Ingresar
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={enterDemo}
                disabled={demoLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/90 transition-all glow-green shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
              >
                {demoLoading ? "Iniciando..." : "Cuenta Demo"}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                Automatización Inteligente para WhatsApp
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 uppercase tracking-tighter">
                <span className="text-foreground">Escale su </span>
                <span className="gradient-cyber block">Negocio Digital</span>
                <span className="text-foreground">con IA</span>
              </h1>

              <p className="text-base md:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed opacity-80 uppercase tracking-tight font-medium">
                Automatice sus ventas y atención al cliente en WhatsApp. Respuestas inteligentes, gestión de prospectos y atención 24/7 sin complicaciones.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={enterDemo}
                  className="px-10 py-5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-green shadow-[0_20px_40px_-10px_rgba(0,255,136,0.3)]"
                >
                  {demoLoading ? "Cargando..." : "Cuenta Demo"}
                </motion.button>
                <Link
                  href="/login"
                  className="px-10 py-5 glass border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-foreground hover:bg-white/5 hover:border-white/20 transition-all text-center"
                >
                  Cuenta Real
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 border-t border-white/5 pt-10">
                {[
                  { icon: Shield, text: "Atención Segura" },
                  { icon: Zap, text: "Ventas 24/7" },
                  { icon: Globe, text: "Escalabilidad" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col gap-2">
                    <Icon className="w-5 h-5 text-primary opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-20 z-0 opacity-20 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/20 blur-3xl animate-pulse" />
              
              <div className="relative z-10 glass-premium border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                  </div>
                  <div className="flex-1 bg-black/40 rounded-lg px-4 py-1.5 text-[10px] font-mono text-muted-foreground text-center tracking-widest uppercase">
                    panel.flowsoftware.app
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {STATS.map(({ value, label, color }) => (
                      <div key={label} className="bg-white/2 border border-white/5 rounded-2xl p-5 group hover:border-primary/30 transition-all">
                        <div className={`text-2xl font-black uppercase tracking-tighter ${color}`}>{value}</div>
                        <div className="text-[9px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-60">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/2 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Actividad Reciente</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] text-primary font-black uppercase tracking-widest">Actualizado</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: "Cliente_01", msg: "Consultando precios de planes...", time: "2m" },
                        { name: "Asistente", msg: "Enviando catálogo actualizado", time: "ahora" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                            {item.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-foreground uppercase tracking-tight">{item.name}</div>
                            <p className="text-[10px] text-muted-foreground truncate opacity-60 font-mono italic">{item.msg}</p>
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground opacity-40 uppercase tracking-tighter">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(0,255,136,0.05)]">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-foreground uppercase tracking-widest">Asistente Virtual Activo</div>
                      <div className="text-[9px] text-primary/70 font-black uppercase tracking-widest">Respondiendo automáticamente</div>
                    </div>
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section id="beneficios" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6"
            >
              <Layers className="w-3.5 h-3.5" />
              Características del Servicio
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none mb-6">
              Venda más en <span className="gradient-cyber">Piloto Automático</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto uppercase text-sm tracking-widest opacity-60">
              Automatización diseñada para maximizar conversiones y atención al cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div 
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-premium border-white/5 rounded-3xl p-8 hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:border-primary/30 group-hover:text-primary transition-all group-hover:scale-110">
                  <Icon className="w-6 h-6 transition-all" />
                </div>
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-60 font-medium">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="como-funciona" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter mb-6">
              Configuración en <span className="gradient-cyber">Tiempo Real</span>
            </h2>
            <p className="text-muted-foreground uppercase text-xs tracking-[0.3em] opacity-60">Tres pasos simples para automatizar su canal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "PASO_01", icon: Smartphone, title: "Vincule WhatsApp", desc: "Escanee el código QR para conectar su número a nuestra plataforma de gestión inteligente." },
              { step: "PASO_02", icon: Brain, title: "Entrene su Asistente", desc: "Suba información sobre sus productos o servicios. La IA aprende y se personaliza de inmediato." },
              { step: "PASO_03", icon: TrendingUp, title: "Venda Automáticamente", desc: "Su asistente responde consultas, califica leads y gestiona cierres las 24 horas del día." },
            ].map(({ step, icon: Icon, title, desc }, idx) => (
              <motion.div 
                key={step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative text-center group"
              >
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[65%] w-[40%] h-[1px] bg-gradient-to-r from-primary/40 to-transparent border-t border-dashed border-primary/20" />
                )}
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-black border border-white/5 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all glow-green-sm relative z-10">
                    <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-primary text-black text-[9px] font-black uppercase tracking-widest z-20 shadow-[0_0_15px_#00ff88]">
                    {step}
                  </div>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">{title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-widest opacity-60 max-w-xs mx-auto">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-premium border-primary/30 rounded-[3rem] p-16 relative overflow-hidden glow-green"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(0,255,136,0.2)]">
                <Cpu className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter mb-8 leading-none">
                ¿Listo para <br />
                <span className="gradient-cyber">Automatizar?</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-12 uppercase tracking-[0.3em] opacity-70">
                Pruebe el sistema ahora mismo y transforme su atención.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={enterDemo}
                  className="px-12 py-5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-green shadow-[0_20px_40px_-10px_rgba(0,255,136,0.4)]"
                >
                  Probar Cuenta Demo
                </button>
                <Link href="/login" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-all">
                  Ingresar a mi Cuenta Real
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <Logo size="md" />
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] leading-relaxed max-w-sm opacity-50">
                Plataforma avanzada de automatización para WhatsApp. 
                Tecnología inteligente diseñada para negocios con visión de futuro.
              </p>
            </div>
            {[
              { title: "SISTEMA", links: ["Capacidades", "Arquitectura", "Seguridad"] },
              { title: "SERVICIO", links: ["Precios", "Soporte", "Planes"] },
              { title: "CONTACTO", links: ["Ventas", "Ayuda", "Privacidad"] },
            ].map(({ title, links }) => (
              <div key={title} className="space-y-6">
                <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors opacity-60 hover:opacity-100">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30 italic">
              © 2026 FlowSoftware. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-8 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
              <a href="#" className="hover:text-primary transition-colors">POLITICAS_PRIVACIDAD</a>
              <a href="#" className="hover:text-primary transition-colors">TERMINOS_SERVICIO</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
