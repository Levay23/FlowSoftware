import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Zap, Users, TrendingUp, ArrowRight,
  CheckCircle, Smartphone, Brain, Send, Clock,
  MessageCircle, Shield, BarChart3
} from "lucide-react";

const BENEFITS = [
  { icon: Clock, title: "Automatizacion 24/7", desc: "Tu bot trabaja mientras duermes. Responde preguntas, califica leads y cierra ventas a cualquier hora." },
  { icon: Brain, title: "Respuestas Inteligentes", desc: "IA entrenada con tu informacion de negocio. Respuestas precisas y personalizadas para cada cliente." },
  { icon: Send, title: "Envios Masivos", desc: "Llega a todos tus contactos de WhatsApp con un clic. Sistema anti-bloqueo con delays inteligentes." },
  { icon: Users, title: "Gestion de Clientes", desc: "CRM integrado con historial de conversaciones y segmentacion avanzada de contactos." },
];

const STATS = [
  { value: "1,248", label: "Mensajes enviados", color: "text-primary" },
  { value: "342", label: "Contactos activos", color: "text-blue-400" },
  { value: "89", label: "Conversaciones", color: "text-purple-400" },
  { value: "100%", label: "Bot activo", color: "text-primary" },
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
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${base}/api/auth/demo`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Error");
      login(data.token, data.user);
      setLocation("/dashboard");
    } catch {
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-border" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-green-sm">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">FlowSoftware</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#beneficios" className="hover:text-foreground transition-colors">Beneficios</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Ingresar
            </Link>
            <button
              onClick={enterDemo}
              disabled={demoLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
            >
              {demoLoading ? "Cargando..." : "Probar gratis"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — two-column on desktop */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #00ff88 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text + CTAs */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass border border-primary/30 rounded-full text-xs font-medium text-primary mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Automatiza tu WhatsApp con inteligencia artificial
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-5">
                <span className="text-foreground">Vende en </span>
                <span className="gradient-text">piloto automatico</span>
                <br />
                <span className="text-foreground">con IA y WhatsApp</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Conecta tu WhatsApp, entrena tu bot con la informacion de tu negocio y deja que la IA responda y venda mientras tu descansas.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
                <button
                  onClick={enterDemo}
                  disabled={demoLoading}
                  className="flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                >
                  {demoLoading ? "Preparando..." : "Probar la plataforma"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-7 py-3.5 glass border border-border rounded-xl font-semibold text-base text-foreground hover:border-primary/50 transition-all"
                >
                  Ingresar con mi cuenta
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {[
                  { icon: Shield, text: "Sin riesgo" },
                  { icon: Zap, text: "Activo en minutos" },
                  { icon: MessageCircle, text: "Sin limite de mensajes" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="glass border border-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-primary/50" />
                <div className="ml-3 flex-1 bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground">
                  whatsbot.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  {STATS.map(({ value, label, color }) => (
                    <div key={label} className="bg-background/60 border border-border/50 rounded-xl p-3.5">
                      <div className={`text-2xl font-black ${color}`}>{value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp status */}
                <div className="bg-background/60 border border-border/50 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground">Estado WhatsApp</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-primary font-medium">Conectado</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Maria Garcia", msg: "¿Hacen envios a domicilio?", time: "hace 2m" },
                      { name: "Carlos Lopez", msg: "Quiero ver el catalogo", time: "hace 5m" },
                      { name: "Ana Martinez", msg: "Bot respondio automaticamente", time: "hace 8m" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                          {item.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{item.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bot status */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-foreground">Bot IA activo</div>
                    <div className="text-[11px] text-muted-foreground">Respondiendo automaticamente</div>
                  </div>
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Beneficios reales
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              Todo lo que necesitas para
              <span className="gradient-text"> escalar tu negocio</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Una plataforma completa para automatizar tu comunicacion en WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass border border-border rounded-2xl p-6 hover:border-primary/40 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/4 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              Listo en <span className="gradient-text">3 simples pasos</span>
            </h2>
            <p className="text-muted-foreground">Sin configuraciones complejas. Sin conocimientos tecnicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Smartphone, title: "Conecta tu WhatsApp", desc: "Escanea el codigo QR desde tu telefono. Tu sesion queda activa permanentemente." },
              { step: "02", icon: Brain, title: "Entrena tu bot", desc: "Sube documentos sobre tus productos o servicios. La IA aprende y responde como experto." },
              { step: "03", icon: TrendingUp, title: "Automatiza tus ventas", desc: "El bot responde 24/7, califica leads y envia mensajes masivos. Tu solo supervisas." },
            ].map(({ step, icon: Icon, title, desc }, idx) => (
              <div key={step} className="relative text-center group">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[40%] h-px border-t border-dashed border-primary/30" />
                )}
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-all glow-green-sm">
                    <Icon className="w-9 h-9 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                    {step}
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features list */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium mb-5">
                <Zap className="w-3.5 h-3.5" />
                Panel de control avanzado
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-5">
                Un panel completo para
                <span className="gradient-text"> dominar WhatsApp</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Dashboard con estadisticas en tiempo real",
                  "Contactos de WhatsApp sincronizados automaticamente",
                  "Chat en vivo con historial de conversaciones",
                  "Envios masivos con anti-bloqueo inteligente",
                  "Bot IA entrenable con tus documentos y Q&A",
                  "Analizador de documentos con IA (Groq)",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={enterDemo}
                disabled={demoLoading}
                className="mt-7 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
              >
                {demoLoading ? "Cargando..." : "Ver el panel en accion"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="glass border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                <span className="ml-2 text-xs text-muted-foreground">Entrenamiento IA</span>
              </div>
              <div className="p-5 space-y-3">
                {/* Training mockup */}
                <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                  {["Por Nicho", "Q&A", "Analizador IA", "Docs"].map((tab, i) => (
                    <div key={tab} className={`flex-1 text-center text-[11px] py-1.5 rounded-md font-medium ${i === 2 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Analizador de Documentos</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">La IA organiza tu contenido automaticamente</div>
                    </div>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 text-[11px] text-muted-foreground font-mono leading-relaxed">
                    <div className="text-primary font-semibold mb-1">## DESCRIPCION DEL NEGOCIO</div>
                    <div>Restaurante familiar especializado en comida...</div>
                    <div className="text-primary font-semibold mt-2 mb-1">## PRODUCTOS Y PRECIOS</div>
                    <div>Menu del dia: $15.00 | Paella: $22.00...</div>
                    <div className="text-primary font-semibold mt-2 mb-1">## PREGUNTAS FRECUENTES</div>
                    <div>¿Tienen delivery? Si, con cobertura en...</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-background/60 border border-border/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-black text-primary">12</div>
                    <div className="text-[10px] text-muted-foreground">Nichos disponibles</div>
                  </div>
                  <div className="flex-1 bg-background/60 border border-border/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-black text-blue-400">Q&A</div>
                    <div className="text-[10px] text-muted-foreground">Pares ilimitados</div>
                  </div>
                  <div className="flex-1 bg-background/60 border border-border/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-black text-purple-400">IA</div>
                    <div className="text-[10px] text-muted-foreground">Groq powered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong border border-primary/30 rounded-3xl p-10 relative overflow-hidden glow-green">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/8 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5 glow-green">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
                Empieza hoy y
                <span className="gradient-text"> vende en automatico</span>
              </h2>
              <p className="text-muted-foreground mb-7">
                Prueba la plataforma ahora mismo o ingresa con tu cuenta real.
              </p>
              <button
                onClick={enterDemo}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
              >
                {demoLoading ? "Preparando..." : "Probar la plataforma gratis"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="mt-4">
                <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ya tengo cuenta — Ingresar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">FlowSoftware</span>
              </div>
              <p className="text-sm text-muted-foreground">La plataforma de automatizacion de WhatsApp mas completa del mercado.</p>
            </div>
            {[
              { title: "Producto", links: ["Caracteristicas", "API", "Integraciones"] },
              { title: "Empresa", links: ["Sobre nosotros", "Blog", "Casos de exito"] },
              { title: "Soporte", links: ["Documentacion", "Centro de ayuda", "Privacidad"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-foreground text-sm mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">© 2026 FlowSoftware. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terminos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
