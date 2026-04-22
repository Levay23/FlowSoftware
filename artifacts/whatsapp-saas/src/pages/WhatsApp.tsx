import { useState, useEffect, useRef } from "react";
import { useGetWhatsappStatus, useConnectWhatsapp, useDisconnectWhatsapp, getGetWhatsappStatusQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Smartphone, Wifi, WifiOff, RefreshCw, QrCode, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";

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

    if (status?.qrCode) {
      setQrCode(status.qrCode);
    }
  }, [status?.status, status?.qrCode]);

  // Auto-reconnect once if there's a previous session
  useEffect(() => {
    if (
      status?.status === "disconnected" &&
      status.hasPreviousSession &&
      !connectMutation.isPending &&
      !autoReconnectTried.current
    ) {
      autoReconnectTried.current = true;
      connectMutation.mutate();
    }
  }, [status?.status, status?.hasPreviousSession, connectMutation]);

  // Count how long we've been stuck in "connecting" without a QR
  useEffect(() => {
    if (status?.status === "connecting" && !qrCode) {
      stuckIntervalRef.current = setInterval(() => {
        setStuckTimer(prev => prev + 1);
      }, 1000);
    } else {
      setStuckTimer(0);
      if (stuckIntervalRef.current) clearInterval(stuckIntervalRef.current);
    }
    return () => {
      if (stuckIntervalRef.current) clearInterval(stuckIntervalRef.current);
    };
  }, [status?.status, qrCode]);

  const isConnected = status?.status === "connected";
  const isConnecting = status?.status === "connecting" || connectMutation.isPending || forceLoading;
  const isStuck = stuckTimer >= 8 && !qrCode;

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Conexion WhatsApp</h1>
          <p className="text-muted-foreground text-sm mt-1">Conecta y gestiona tu sesion de WhatsApp</p>
        </div>

        {/* Status card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isConnected ? "bg-primary/20" : "bg-muted/50"}`}>
                <Smartphone className={`w-7 h-7 ${isConnected ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">Estado de Conexion</h2>
                  {isConnected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <div className={`text-sm font-medium mt-1 ${isConnected ? "text-primary" : isConnecting ? "text-yellow-400" : "text-muted-foreground"}`}>
                  {isLoading ? "Verificando..." : isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Desconectado"}
                </div>
                {isConnected && status?.phone && (
                  <div className="text-xs text-muted-foreground mt-1">+{status.phone}</div>
                )}
                {!isConnected && status?.hasPreviousSession && !isConnecting && (
                  <div className="text-xs text-muted-foreground mt-1">Hay una sesion previa guardada</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:justify-end flex-wrap">
              {isConnected ? (
                <>
                  <div className="flex items-center gap-1.5 text-primary text-sm">
                    <Wifi className="w-4 h-4" />
                    <span>Activo</span>
                  </div>
                  <button
                    data-testid="btn-reconnect-force"
                    onClick={forceReconnect}
                    disabled={forceLoading}
                    className="px-3 py-2 text-xs border border-border text-muted-foreground rounded-lg hover:bg-muted/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Cambiar cuenta
                  </button>
                  <button
                    data-testid="btn-disconnect"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="px-4 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all disabled:opacity-50"
                  >
                    {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                  {!isConnecting && (
                    <button
                      data-testid="btn-connect"
                      onClick={() => {
                        autoReconnectTried.current = true;
                        connectMutation.mutate();
                      }}
                      disabled={connectMutation.isPending}
                      className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
                    >
                      Conectar WhatsApp
                    </button>
                  )}
                  {(isConnecting || status?.hasPreviousSession) && (
                    <button
                      data-testid="btn-force-reconnect"
                      onClick={forceReconnect}
                      disabled={forceLoading}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-muted-foreground rounded-lg text-sm hover:bg-muted/30 hover:text-foreground transition-all disabled:opacity-50"
                    >
                      <RotateCcw className={`w-4 h-4 ${forceLoading ? "animate-spin" : ""}`} />
                      {forceLoading ? "Limpiando sesion..." : "Generar QR nuevo"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stuck alert */}
        {isStuck && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Sesion anterior detectada</p>
              <p className="text-xs text-muted-foreground mb-3">
                Hay archivos de una sesion antigua que impiden generar un QR nuevo. Haz clic en "Generar QR nuevo" para limpiar la sesion y vincular desde cero.
              </p>
              <button
                onClick={forceReconnect}
                disabled={forceLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${forceLoading ? "animate-spin" : ""}`} />
                {forceLoading ? "Limpiando..." : "Limpiar sesion y generar QR nuevo"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* QR Code section */}
        {!isConnected && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-8 text-center">
            {qrCode || (isConnecting && !isStuck) ? (
              <div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    {qrCode ? "Escanea el codigo QR" : "Generando codigo QR..."}
                  </h3>
                </div>

                <div className="inline-block p-3 sm:p-4 bg-white rounded-2xl mb-6 glow-green">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="w-56 h-56 max-w-[70vw] max-h-[70vw] object-contain" />
                  ) : (
                    <div className="w-56 h-56 max-w-[70vw] max-h-[70vw] flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-10 h-10 text-muted-foreground animate-spin" />
                      <p className="text-xs text-muted-foreground">Conectando con WhatsApp...</p>
                    </div>
                  )}
                </div>

                {qrCode && (
                  <div className="space-y-2 mb-4 max-w-xs mx-auto">
                    {[
                      "Abre WhatsApp en tu telefono",
                      "Ve a Configuracion → Dispositivos vinculados",
                      "Toca \"Vincular un dispositivo\" y escanea este QR",
                    ].map((step, i) => (
                      <div key={step} className="flex items-start gap-3 text-left">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Esperando que escanees el QR...</span>
                </div>

                <button
                  onClick={forceReconnect}
                  disabled={forceLoading}
                  className="flex items-center gap-1.5 mx-auto px-4 py-2 border border-border text-muted-foreground rounded-lg text-xs hover:bg-muted/30 hover:text-foreground transition-all disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${forceLoading ? "animate-spin" : ""}`} />
                  El QR no funciona? Genera uno nuevo
                </button>
              </div>
            ) : (
              <div>
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-semibold text-foreground mb-2">
                  {status?.hasPreviousSession ? "Sesion anterior encontrada" : "Sin conexion WhatsApp"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {status?.hasPreviousSession
                    ? "Puedes intentar reconectar con la sesion previa, o generar un QR nuevo para vincular otro numero."
                    : "Haz clic en \"Conectar WhatsApp\" para generar el codigo QR y vincular tu telefono."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {status?.hasPreviousSession && (
                    <button
                      onClick={() => {
                        autoReconnectTried.current = true;
                        connectMutation.mutate();
                      }}
                      disabled={connectMutation.isPending}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${connectMutation.isPending ? "animate-spin" : ""}`} />
                      {connectMutation.isPending ? "Reconectando..." : "Reconectar sesion previa"}
                    </button>
                  )}
                  <button
                    onClick={forceReconnect}
                    disabled={forceLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      status?.hasPreviousSession
                        ? "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                    }`}
                  >
                    <RotateCcw className={`w-4 h-4 ${forceLoading ? "animate-spin" : ""}`} />
                    {forceLoading ? "Limpiando sesion..." : status?.hasPreviousSession ? "Vincular numero nuevo" : "Conectar WhatsApp"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isConnected && (
          <div className="bg-card border border-primary/30 rounded-xl p-6 text-center glow-green">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">WhatsApp Conectado</h3>
            <p className="text-sm text-muted-foreground">
              {status?.phone
                ? <>Numero vinculado: <span className="text-primary font-medium">+{status.phone}</span></>
                : "Sesion vinculada correctamente"}
            </p>
            {status?.connectedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Activo desde: {new Date(status.connectedAt).toLocaleString("es-ES")}
              </p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "WhatsApp Web real", desc: "Conexion via QR desde Dispositivos vinculados en tu telefono" },
            { title: "Sesion persistente", desc: "La sesion se restaura automaticamente si el servidor reinicia" },
            { title: "Reconexion limpia", desc: "Usa \"Generar QR nuevo\" si la sesion queda atascada o quieres cambiar de numero" },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-muted/30 border border-border rounded-xl p-4">
              <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
