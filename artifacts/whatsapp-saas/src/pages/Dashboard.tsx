import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Smartphone, Users, MessageSquare, Bot, TrendingUp, Activity, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  const statCards = [
    {
      label: "Estado WhatsApp",
      value: stats?.whatsappStatus === "connected" ? "Conectado" : stats?.whatsappStatus === "connecting" ? "Conectando..." : "Desconectado",
      icon: Smartphone,
      color: stats?.whatsappStatus === "connected" ? "text-primary" : stats?.whatsappStatus === "connecting" ? "text-yellow-400" : "text-muted-foreground",
      bg: stats?.whatsappStatus === "connected" ? "bg-primary/10" : "bg-muted/50",
      dot: stats?.whatsappStatus === "connected",
    },
    {
      label: "Total Contactos",
      value: isLoading ? "..." : String(stats?.totalContacts ?? 0),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Mensajes Enviados",
      value: isLoading ? "..." : String(stats?.messagesSent ?? 0),
      icon: MessageSquare,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Bot IA",
      value: stats?.botStatus === "active" ? "Activo" : "Inactivo",
      icon: Bot,
      color: stats?.botStatus === "active" ? "text-primary" : "text-muted-foreground",
      bg: stats?.botStatus === "active" ? "bg-primary/10" : "bg-muted/50",
      dot: stats?.botStatus === "active",
    },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Vista general de tu plataforma WhatsApp</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, dot }) => (
            <div key={label} data-testid={`card-${label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {dot && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-primary">Live</span>
                  </div>
                )}
              </div>
              <div className={`text-xl font-bold ${color} mb-1`}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Additional stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Conversaciones</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats?.totalConversations ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Total activas</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Enviados</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats?.messagesSent ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Mensajes exitosos</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">Fallidos</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{stats?.messagesFailed ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Mensajes fallidos</div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Actividad Reciente</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((item) => (
                <div key={item.id} data-testid={`activity-${item.id}`} className="flex items-start gap-3 sm:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === "message_sent" ? "bg-primary" : item.type === "message_failed" ? "bg-destructive" : "bg-yellow-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground sm:truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString("es-ES")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay actividad reciente</p>
              <p className="text-xs">Comienza enviando mensajes o conectando WhatsApp</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
