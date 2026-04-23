import { useState, useEffect } from "react";
import { useGetChatbotConfig, useUpdateChatbotConfig, getGetChatbotConfigQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Bot, Save, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
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
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Chatbot IA</h1>
          <p className="text-muted-foreground text-sm mt-1">Configura tu asistente inteligente de WhatsApp</p>
        </div>

        {/* Toggle card */}
        <div className={`mb-6 p-4 sm:p-6 rounded-xl border transition-all ${isActive ? "bg-primary/10 border-primary/30 glow-green" : "bg-card border-border"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-primary/20" : "bg-muted/50"}`}>
                <Bot className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground">Bot Automatico</h2>
                <p className={`text-sm ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {isActive ? "Respondiendo mensajes automaticamente" : "Bot desactivado"}
                </p>
              </div>
            </div>
            <button
              data-testid="btn-toggle-bot"
              onClick={handleToggle}
              className="flex items-center gap-2 transition-all"
            >
              {isActive ? (
                <ToggleRight className="w-10 h-10 text-primary" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Config form */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Prompt del Sistema</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Define la personalidad y comportamiento base del bot</p>
            <textarea
              data-testid="input-system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              placeholder="Describe el comportamiento y personalidad del bot..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-sm text-foreground mb-2">Mensaje de Bienvenida</h3>
              <p className="text-xs text-muted-foreground mb-3">Primer mensaje cuando un contacto escribe</p>
              <textarea
                data-testid="input-welcome-message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                placeholder="Hola! Bienvenido..."
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-sm text-foreground mb-2">Mensaje de Fallback</h3>
              <p className="text-xs text-muted-foreground mb-3">Cuando el bot no entiende la pregunta</p>
              <textarea
                data-testid="input-fallback-message"
                value={fallbackMessage}
                onChange={(e) => setFallbackMessage(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                placeholder="Lo siento, no entendi..."
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Probar respuesta con Groq</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Este probador usa el mismo motor que responde mensajes entrantes de WhatsApp cuando el bot esta activo.
            </p>
            <textarea
              data-testid="input-test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              placeholder="Escribe un mensaje de cliente para probar..."
            />
            <div className="mt-4 flex justify-stretch sm:justify-end">
              <button
                data-testid="btn-test-chatbot"
                onClick={handleTestReply}
                disabled={testing || !testMessage.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {testing ? "Probando..." : "Probar respuesta"}
              </button>
            </div>
            {testReply && (
              <div className="mt-4 rounded-lg border border-primary/25 bg-primary/10 p-4">
                <div className="text-xs text-primary font-semibold mb-2">Respuesta del bot</div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{testReply}</p>
              </div>
            )}
            {testError && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {testError}
              </div>
            )}
          </div>

          <div className="flex justify-stretch sm:justify-end">
            <button
              data-testid="btn-save-chatbot"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                saved
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
              } disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Guardando..." : saved ? "Guardado!" : "Guardar configuracion"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
