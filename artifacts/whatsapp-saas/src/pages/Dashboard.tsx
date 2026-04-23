import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { 
  Smartphone, Users, MessageSquare, Bot, 
  TrendingUp, Activity, CheckCircle, XCircle,
  Zap, ArrowUpRight, Clock
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  const statCards = [
    {
      label: "Estado WhatsApp",
      value: stats?.whatsappStatus === "connected" ? "Conectado" : stats?.whatsappStatus === "connecting" ? "Conectando..." : "Desconectado",
      icon: Smartphone,
      color: stats?.whatsappStatus === "connected" ? "text-primary" : stats?.whatsappStatus === "connecting" ? "text-yellow-400" : "text-muted-foreground",
      glow: stats?.whatsappStatus === "connected" ? "hsla(175, 100%, 36%, 0.2)" : "transparent",
      dot: stats?.whatsappStatus === "connected",
    },
    {
      label: "Total Contactos",
      value: isLoading ? "..." : String(stats?.totalContacts ?? 0),
      icon: Users,
      color: "text-blue-400",
      glow: "hsla(190, 100%, 45%, 0.2)",
    },
    {
      label: "Mensajes Enviados",
      value: isLoading ? "..." : String(stats?.messagesSent ?? 0),
      icon: MessageSquare,
      color: "text-primary",
      glow: "hsla(175, 100%, 36%, 0.2)",
    },
    {
      label: "Bot IA",
      value: stats?.botStatus === "active" ? "Activo" : "Inactivo",
      icon: Bot,
      color: stats?.botStatus === "active" ? "text-primary" : "text-muted-foreground",
      glow: stats?.botStatus === "active" ? "hsla(175, 100%, 36%, 0.2)" : "transparent",
      dot: stats?.botStatus === "active",
    },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Sincronizado
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
              Resumen <span className="gradient-cyber">General</span>
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-60">Visión global de tu operación en WhatsApp.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md"
          >
            <div className="text-right">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado Global</div>
              <div className="text-sm font-black text-primary">SISTEMA ONLINE</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-green">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Main Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {statCards.map((card, idx) => (
            <motion.div 
              key={card.label}
              variants={item}
              className="glass-card p-6 relative group overflow-hidden"
              style={{ boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px -5px ${card.glow}` }}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <card.icon className="w-12 h-12" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {card.dot && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black text-primary uppercase">Live</span>
                  </div>
                )}
              </div>
              
              <div className={`text-3xl font-black tracking-tight ${card.color} mb-1`}>{card.value}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-premium p-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Rendimiento Mensajes</h2>
                <p className="text-xs text-muted-foreground">Flujo de comunicación actual</p>
              </div>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Conversaciones</div>
                <div className="text-4xl font-black text-foreground tracking-tighter">{stats?.totalConversations ?? 0}</div>
                <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.5% vs ayer
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exitosos</div>
                <div className="text-4xl font-black text-primary tracking-tighter">{stats?.messagesSent ?? 0}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%]" />
                  </div>
                  85% ratio
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fallidos</div>
                <div className="text-4xl font-black text-destructive tracking-tighter">{stats?.messagesFailed ?? 0}</div>
                <div className="text-[10px] text-muted-foreground italic">No requiere atención</div>
              </div>
            </div>
          </motion.div>

          {/* Activity Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-premium p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Actividad</h2>
              </div>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[300px] scrollbar-hide">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.05) }}
                    key={item.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shadow-[0_0_5px_currentColor] ${
                      item.type === "message_sent" ? "text-primary bg-primary" : item.type === "message_failed" ? "text-destructive bg-destructive" : "text-yellow-400 bg-yellow-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.description}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 font-mono uppercase opacity-60">
                        {new Date(item.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
                  <Activity className="w-10 h-10 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Sin actividad</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
