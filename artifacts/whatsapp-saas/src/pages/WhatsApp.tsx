import { useState, useEffect, useRef } from "react";
import { useGetWhatsappStatus, useConnectWhatsapp, useDisconnectWhatsapp, getGetWhatsappStatusQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, Wifi, WifiOff, RefreshCw, 
  QrCode, CheckCircle, RotateCcw, AlertTriangle,
  Zap, Shield, Terminal as TerminalIcon
} from "lucide-react";

export default function WhatsApp() {
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [forceLoading, setForceLoading] = useState(false);
  const [stuckTimer, setStuckTimer] = useState(0);
  const autoReconnectTried = useRef(false);
  const stuckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: status, isLoading } = useGetWhatsappStatus({
    query: {
      queryKey: getGetWhatsappStatusQueryKey(),
      refetchInterval: (q) => {
        const s = q.state.data?.status;
        if (s === "connecting") return 4000;
        if (s === "connected") return 15000;
        return 10000;
      },
    },
  });

  const connectMutation = useConnectWhatsapp({
    mutation: {
      onSuccess: (data) => {
        setError("");
        setQrCode(data.qrCode ?? null);
        setStuckTimer(0);
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: getGetWhatsappStatusQueryKey() });
        }, data.status === "connected" ? 500 : 8000);
      },
      onError: (err: unknown) => {
        const e = err as { data?: { error?: string }; message?: string };
        setError(e?.data?.error || e?.message || "No se pudo conectar WhatsApp");
      },
    },
  });

  const disconnectMutation = useDisconnectWhatsapp({
    mutation: {
      onSuccess: () => {
        setQrCode(null);
        setStuckTimer(0);
        autoReconnectTried.current = false;
        queryClient.invalidateQueries({ queryKey: getGetWhatsappStatusQueryKey() });
      },
    },
  });

  const forceReconnect = async () => {
    setForceLoading(true);
    setError("");
    setQrCode(null);
    setStuckTimer(0);
    autoReconnectTried.current = true;
    try {
      const result = await customFetch<{
        qrCode?: string | null;
        status: string;
        phone?: string | null;
      }>("/api/whatsapp/reconnect", { method: "POST" });

      setQrCode(result.qrCode ?? null);
      queryClient.invalidateQueries({ queryKey: getGetWhatsappStatusQueryKey() });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string }; message?: string };
      setError(e?.data?.error || e?.message || "Error al reconectar");
    } finally {
      setForceLoading(false);
    }
  };

  useEffect(() => {
    if (status?.status === "connected") {
      setQrCode(null);
      setStuckTimer(0);
      autoReconnectTried.current = false;
      if (stuckIntervalRef.current) clearInterval(stuckIntervalRef.current);
      return;
    }
    if (status?.qrCode) setQrCode(status.qrCode);
  }, [status?.status, status?.qrCode]);

  useEffect(() => {
    if (status?.status === "disconnected" && status.hasPreviousSession && !connectMutation.isPending && !autoReconnectTried.current) {
      autoReconnectTried.current = true;
      connectMutation.mutate();
    }
  }, [status?.status, status?.hasPreviousSession, connectMutation]);

  useEffect(() => {
    if (status?.status === "connecting" && !qrCode) {
      stuckIntervalRef.current = setInterval(() => setStuckTimer(prev => prev + 1), 1000);
    } else {
      setStuckTimer(0);
      if (stuckIntervalRef.current) clearInterval(stuckIntervalRef.current);
    }
    return () => { if (stuckIntervalRef.current) clearInterval(stuckIntervalRef.current); };
  }, [status?.status, qrCode]);

  const isConnected = status?.status === "connected";
  const isConnecting = status?.status === "connecting" || connectMutation.isPending || forceLoading;
  const isStuck = stuckTimer >= 8 && !qrCode;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Estado de Conexión
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
              Conexión <span className="gradient-cyber">WhatsApp</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${isConnected ? "bg-primary/10 border-primary/30 text-primary glow-green-sm" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary animate-pulse shadow-[0_0_10px_#00ff88]" : "bg-muted-foreground"}`} />
              <span className="text-xs font-black uppercase tracking-tighter">
                {isLoading ? "Verificando..." : isConnected ? "Sistema Online" : "Sistema Offline"}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Connection Panel */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium p-8 relative overflow-hidden"
            >
              {/* Decorative scan line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />

              <div className="flex flex-col md:flex-row gap-10 items-center">
                {/* QR Area */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl group-hover:bg-primary/10 transition-all" />
                  <div className="relative w-72 h-72 lg:w-80 lg:h-80 bg-white rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(0,255,136,0.3)] flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      {isConnected ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center text-center p-6"
                        >
                          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <CheckCircle className="w-16 h-16 text-primary" />
                          </div>
                          <div className="text-2xl font-black text-black">VINCULADO</div>
                          <div className="text-xs text-black/60 font-medium mt-2">Dispositivo operativo</div>
                        </motion.div>
                      ) : qrCode ? (
                        <motion.img 
                          key="qr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={qrCode} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <motion.div 
                          key="loader"
                          className="flex flex-col items-center gap-4 text-center"
                        >
                          <RefreshCw className="w-12 h-12 text-black/20 animate-spin" />
                          <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">Generando Protocolo</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                    
                    {!isConnected && qrCode && (
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-primary/20 absolute animate-scanning-beam" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions / Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Sincronización de Núcleo</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Sigue estos parámetros para establecer el enlace de datos con FlowSoftware.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Abre WhatsApp en tu dispositivo móvil.",
                      "Accede al menú de 'Dispositivos Vinculados'.",
                      "Escanea el código para autorizar el acceso de la IA."
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-black transition-all">
                          0{i + 1}
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4">
                    {isConnected ? (
                      <button 
                        onClick={() => disconnectMutation.mutate()}
                        className="px-6 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-black uppercase hover:bg-destructive/20 transition-all"
                      >
                        Abortar Conexión
                      </button>
                    ) : (
                      <button 
                        onClick={forceReconnect}
                        disabled={forceLoading}
                        className="px-8 py-3.5 rounded-xl bg-primary text-black text-sm font-black uppercase hover:bg-primary/90 transition-all glow-green flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        {forceLoading ? "Reiniciando..." : "Generar Nuevo Enlace"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Terminal Logs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[11px]"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <TerminalIcon className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary uppercase tracking-widest">System Logs</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="space-y-1.5 opacity-80 h-32 overflow-y-auto scrollbar-hide">
                <div className="text-muted-foreground">[SYSTEM] Initializing WhatsApp provider...</div>
                <div className="text-muted-foreground">[AUTH] Verifying previous session keys...</div>
                {status?.hasPreviousSession && <div className="text-primary">[AUTH] Valid session token found.</div>}
                <div className={`${isConnected ? "text-primary" : "text-yellow-400"}`}>
                  [STATUS] Current state: {status?.status?.toUpperCase()}
                </div>
                {isConnected && <div className="text-primary">[CORE] Connection established successfully.</div>}
                {!isConnected && <div className="text-muted-foreground italic">[WAIT] Waiting for QR scan from client...</div>}
                <div className="animate-pulse">_</div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
            {/* Status Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-premium p-6"
            >
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Diagnóstico de Enlace</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Calidad Señal</span>
                    <span className="text-primary font-bold">100%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isConnected ? "100%" : "30%" }}
                      className="h-full bg-primary shadow-[0_0_10px_#00ff88]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-white/5">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Latencia</span>
                  </div>
                  <span className="text-xs font-mono text-primary">12ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Encriptación</span>
                  </div>
                  <span className="text-xs font-mono text-primary">AES-256</span>
                </div>
              </div>
            </motion.div>

            {/* Device Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-premium p-6"
            >
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Dispositivo Enlazado</h4>
              {isConnected && status?.phone ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-foreground">+{status.phone}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">Identidad Verificada</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed italic">
                    Este dispositivo está autorizado para emitir y recibir respuestas automáticas a través del núcleo FlowSoftware.
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 opacity-40">
                  <WifiOff className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sin Enlace Activo</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanning-beam {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scanning-beam {
          animation: scanning-beam 3s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(320px); opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </Layout>
  );
}
