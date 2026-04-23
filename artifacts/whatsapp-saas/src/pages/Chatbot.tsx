import { useState, useEffect } from "react";
import { useGetChatbotConfig, useUpdateChatbotConfig, getGetChatbotConfigQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Save, ToggleLeft, ToggleRight, 
  Sparkles, Brain, Cpu, Zap, Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Chatbot() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data: config, isLoading } = useGetChatbotConfig({ query: { queryKey: getGetChatbotConfigQueryKey() } });

  const [isActive, setIsActive] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [testMessage, setTestMessage] = useState("Hola, quiero informacion sobre sus servicios");
  const [testReply, setTestReply] = useState("");
  const [testError, setTestError] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setIsActive(config.isActive);
      setSystemPrompt(config.systemPrompt);
      setWelcomeMessage(config.welcomeMessage);
      setFallbackMessage(config.fallbackMessage);
    }
  }, [config]);

  const updateMutation = useUpdateChatbotConfig({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatbotConfigQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ data: { isActive, systemPrompt, welcomeMessage, fallbackMessage } });
  };

  const handleToggle = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    updateMutation.mutate({ data: { isActive: newActive } });
  };

  const handleTestReply = async () => {
    if (!token) return;
    setTesting(true);
    setTestReply("");
    setTestError("");
    try {
      const result = await customFetch<{ reply: string }>("/api/chatbot/test-reply", {
        method: "POST",
        body: JSON.stringify({ message: testMessage }),
      });
      setTestReply(result.reply);
    } catch (error) {
      const e = error as { data?: { error?: string }; message?: string };
      setTestError(e?.data?.error || e?.message || "No se pudo generar respuesta");
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <Cpu className="w-3 h-3 fill-current" />
              Gestión de Inteligencia
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">
              Configuración <span className="gradient-cyber">Asistente</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Modela la inteligencia artificial de tu negocio.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 transition-all ${isActive ? "bg-primary/10 border-primary/30 text-primary glow-green-sm" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
              <Brain className={`w-5 h-5 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 leading-none">Status</div>
                <div className="text-xs font-black uppercase tracking-tighter leading-none mt-1">
                  {isActive ? "Asistente Activo" : "Asistente Pausado"}
                </div>
              </div>
              <button 
                onClick={handleToggle}
                className="ml-2 hover:scale-110 transition-transform"
              >
                {isActive ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* System Prompt */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium p-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Núcleo de Comportamiento</h2>
                  <p className="text-[10px] text-muted-foreground">Define el comportamiento del asistente</p>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm font-mono leading-relaxed text-foreground min-h-[250px] focus:outline-none focus:border-primary/50 transition-all scrollbar-hide"
                  placeholder="Eres un asistente experto en..."
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-primary/40 uppercase tracking-widest pointer-events-none">
                  AI CONFIG v1.0
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end"
            >
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                  saved ? "bg-primary/20 text-primary border border-primary/30" : "bg-primary text-black hover:bg-primary/90 glow-green"
                } disabled:opacity-50`}
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? "Sincronizando..." : saved ? "Protocolo Guardado" : "Actualizar Configuración"}
              </button>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Welcome & Fallback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-premium p-6"
              >
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Bienvenida
                </h3>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-muted-foreground min-h-[120px] focus:outline-none focus:border-primary/30 transition-all resize-none"
                  placeholder="Hola! Bienvenido..."
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-premium p-6"
              >
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-destructive" />
                  Fallback
                </h3>
                <textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-muted-foreground min-h-[120px] focus:outline-none focus:border-primary/30 transition-all resize-none"
                  placeholder="Lo siento, no entendí..."
                />
              </motion.div>
            </div>

            {/* Sandbox Test */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-premium p-6 flex flex-col h-full overflow-hidden relative"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Cámara de Pruebas</h2>
                  <p className="text-[10px] text-muted-foreground">Simula impulsos de usuario</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 scrollbar-hide min-h-[200px]">
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-4 text-xs text-foreground">
                    {testMessage}
                  </div>
                </div>

                <AnimatePresence>
                  {testing && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-1 bg-primary rounded-full" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {testReply && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-none p-4 text-xs text-foreground leading-relaxed">
                        {testReply}
                      </div>
                    </motion.div>
                  )}

                  {testError && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center"
                    >
                      {testError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/30 transition-all"
                  placeholder="Enviar señal de prueba..."
                  onKeyDown={(e) => e.key === "Enter" && handleTestReply()}
                />
                <button
                  onClick={handleTestReply}
                  disabled={testing || !testMessage.trim()}
                  className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
