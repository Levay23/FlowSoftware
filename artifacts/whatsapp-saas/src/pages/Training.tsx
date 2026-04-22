import { useState } from "react";
import {
  useGetTrainingDocuments,
  useUploadTrainingDocument,
  useDeleteTrainingDocument,
  getGetTrainingDocumentsQueryKey,
  customFetch,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import {
  Brain,
  Upload,
  FileText,
  Trash2,
  Plus,
  Sparkles,
  BookOpen,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  CheckCircle,
  Tag,
  X,
} from "lucide-react";

const NICHES = [
  { value: "restaurante", label: "Restaurante / Comida", emoji: "🍽️" },
  { value: "ecommerce", label: "Tienda Online / E-commerce", emoji: "🛒" },
  { value: "salud", label: "Salud y Bienestar", emoji: "💊" },
  { value: "inmobiliaria", label: "Inmobiliaria", emoji: "🏠" },
  { value: "educacion", label: "Educacion / Cursos", emoji: "📚" },
  { value: "moda", label: "Moda / Ropa", emoji: "👗" },
  { value: "servicios", label: "Servicios Profesionales", emoji: "💼" },
  { value: "tecnologia", label: "Tecnologia / Software", emoji: "💻" },
  { value: "belleza", label: "Belleza y Estetica", emoji: "💄" },
  { value: "automotriz", label: "Automotriz", emoji: "🚗" },
  { value: "viajes", label: "Viajes y Turismo", emoji: "✈️" },
  { value: "otro", label: "Otro nicho", emoji: "🏢" },
];

const NICHE_SECTIONS: Record<string, string[]> = {
  restaurante: ["Menu y Platos", "Horarios y Ubicacion", "Delivery y Pedidos", "Reservaciones", "Precios y Promociones", "Politica de Cancelacion"],
  ecommerce: ["Catalogo de Productos", "Precios y Descuentos", "Metodos de Pago", "Envios y Tiempos", "Devoluciones", "Garantias"],
  salud: ["Servicios Medicos", "Horarios y Citas", "Seguros Aceptados", "Ubicacion y Contacto", "Precios de Consultas", "Especialidades"],
  inmobiliaria: ["Propiedades Disponibles", "Proceso de Compra/Renta", "Requisitos", "Zonas y Ubicaciones", "Precios", "Contacto con Agente"],
  educacion: ["Cursos Disponibles", "Precios y Becas", "Modalidad (Online/Presencial)", "Certificados", "Horarios", "Requisitos de Inscripcion"],
  moda: ["Colecciones", "Tallas y Guia de Medidas", "Precios y Ofertas", "Envios y Devoluciones", "Cuidado de Prendas", "Metodos de Pago"],
  servicios: ["Servicios Ofrecidos", "Proceso de Trabajo", "Precios y Cotizaciones", "Tiempo de Entrega", "Garantias", "Portafolio"],
  tecnologia: ["Productos y Software", "Planes y Precios", "Soporte Tecnico", "Integraciones", "SLA y Garantias", "Demostraciones"],
  belleza: ["Servicios y Tratamientos", "Precios", "Reservacion de Citas", "Promociones", "Ubicacion y Horarios", "Productos Usados"],
  automotriz: ["Vehiculos Disponibles", "Precios y Financiamiento", "Servicios de Mantenimiento", "Garantias", "Prueba de Manejo", "Ubicacion"],
  viajes: ["Destinos y Paquetes", "Precios e Incluye", "Reservaciones", "Politica de Cancelacion", "Documentos Requeridos", "Contacto"],
  otro: ["Descripcion del Negocio", "Productos/Servicios", "Precios", "Horarios", "Contacto", "Politicas"],
};

type QAPair = { question: string; answer: string };
type Tab = "nicho" | "qa" | "analyzer" | "docs";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Training() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("nicho");

  // Niche tab
  const [selectedNiche, setSelectedNiche] = useState("restaurante");
  const [nicheSections, setNicheSections] = useState<Record<string, string>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [savingNiche, setSavingNiche] = useState(false);
  const [nicheSaved, setNicheSaved] = useState(false);

  // Q&A tab
  const [qaPairs, setQaPairs] = useState<QAPair[]>([{ question: "", answer: "" }]);
  const [qaName, setQaName] = useState("");
  const [savingQA, setSavingQA] = useState(false);
  const [qaSaved, setQaSaved] = useState(false);

  // Analyzer tab
  const [analyzerText, setAnalyzerText] = useState("");
  const [analyzerNiche, setAnalyzerNiche] = useState("");
  const [analyzerName, setAnalyzerName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<string | null>(null);
  const [analyzerSaved, setAnalyzerSaved] = useState(false);
  const [analyzerDragOver, setAnalyzerDragOver] = useState(false);
  const [savingAnalyzed, setSavingAnalyzed] = useState(false);

  const { data: documents = [], isLoading: docsLoading } = useGetTrainingDocuments({
    query: { queryKey: getGetTrainingDocumentsQueryKey() },
  });

  const uploadMutation = useUploadTrainingDocument({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTrainingDocumentsQueryKey() }),
    },
  });

  const deleteMutation = useDeleteTrainingDocument({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTrainingDocumentsQueryKey() }),
    },
  });

  const handleNicheSection = (section: string, value: string) => {
    setNicheSections(prev => ({ ...prev, [section]: value }));
  };

  const saveNicheDocument = async () => {
    const niche = NICHES.find(n => n.value === selectedNiche);
    const sections = NICHE_SECTIONS[selectedNiche] ?? [];
    const filled = sections.filter(s => nicheSections[s]?.trim());
    if (filled.length === 0) return;

    setSavingNiche(true);
    const content = `NICHO: ${niche?.label}\n\n` + filled
      .map(s => `## ${s}\n${nicheSections[s]?.trim()}`)
      .join("\n\n");

    await uploadMutation.mutateAsync({
      data: {
        name: `${niche?.emoji} ${niche?.label} - Informacion del Negocio`,
        content,
        fileType: "txt",
      },
    });
    setSavingNiche(false);
    setNicheSaved(true);
    setNicheSections({});
    setTimeout(() => setNicheSaved(false), 3000);
  };

  const addQAPair = () => setQaPairs(prev => [...prev, { question: "", answer: "" }]);
  const removeQAPair = (i: number) => setQaPairs(prev => prev.filter((_, idx) => idx !== i));
  const updateQAPair = (i: number, field: keyof QAPair, value: string) => {
    setQaPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const saveQADocument = async () => {
    const valid = qaPairs.filter(p => p.question.trim() && p.answer.trim());
    if (valid.length === 0) return;
    setSavingQA(true);
    const content = valid.map((p, i) => `PREGUNTA ${i + 1}: ${p.question.trim()}\nRESPUESTA: ${p.answer.trim()}`).join("\n\n---\n\n");
    await uploadMutation.mutateAsync({
      data: {
        name: qaName.trim() || `Preguntas y Respuestas - ${new Date().toLocaleDateString("es-ES")}`,
        content: `## BASE DE PREGUNTAS FRECUENTES\n\n${content}`,
        fileType: "txt",
      },
    });
    setSavingQA(false);
    setQaSaved(true);
    setQaPairs([{ question: "", answer: "" }]);
    setQaName("");
    setTimeout(() => setQaSaved(false), 3000);
  };

  const handleAnalyzerFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setAnalyzerText(text.slice(0, 10000));
    };
    reader.readAsText(file);
  };

  const runAnalysis = async () => {
    if (!analyzerText.trim() || analyzerText.length < 20) return;
    setAnalyzing(true);
    setAnalyzedResult(null);
    try {
      const res = await customFetch<{ organized: string }>("/api/training/analyze", {
        method: "POST",
        body: JSON.stringify({ content: analyzerText, niche: analyzerNiche || undefined }),
      });
      setAnalyzedResult(res.organized);
    } catch {
      setAnalyzedResult("Error al analizar el documento. Por favor intenta de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveAnalyzedDocument = async () => {
    if (!analyzedResult) return;
    setSavingAnalyzed(true);
    await uploadMutation.mutateAsync({
      data: {
        name: analyzerName.trim() || `Analisis IA${analyzerNiche ? ` - ${analyzerNiche}` : ""} - ${new Date().toLocaleDateString("es-ES")}`,
        content: analyzedResult,
        fileType: "txt",
      },
    });
    setSavingAnalyzed(false);
    setAnalyzerSaved(true);
    setAnalyzedResult(null);
    setAnalyzerText("");
    setAnalyzerName("");
    setTimeout(() => setAnalyzerSaved(false), 3000);
  };

  const tabs: { key: Tab; label: string; icon: typeof Brain }[] = [
    { key: "nicho", label: "Por Nicho", icon: Tag },
    { key: "qa", label: "Preguntas & Respuestas", icon: MessageSquareQuote },
    { key: "analyzer", label: "Analizador IA", icon: Sparkles },
    { key: "docs", label: "Base de Conocimiento", icon: BookOpen },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Entrenamiento IA</h1>
          <p className="text-muted-foreground text-sm mt-1">Entrena tu bot con informacion personalizada de tu negocio</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: NICHO */}
        {activeTab === "nicho" && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm text-foreground mb-1">Selecciona tu nicho de negocio</h2>
              <p className="text-xs text-muted-foreground mb-4">Elige el tipo de negocio y completa cada seccion con la informacion de tu empresa</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
                {NICHES.map(n => (
                  <button
                    key={n.value}
                    onClick={() => { setSelectedNiche(n.value); setNicheSections({}); setExpandedSection(null); }}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      selectedNiche === n.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30 text-foreground"
                    }`}
                  >
                    <div className="text-xl mb-1">{n.emoji}</div>
                    <div className="text-xs font-medium leading-tight">{n.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Secciones para {NICHES.find(n => n.value === selectedNiche)?.label}
                </h3>
                {(NICHE_SECTIONS[selectedNiche] ?? []).map(section => (
                  <div key={section} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${nicheSections[section]?.trim() ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        <span className="text-sm font-medium text-foreground">{section}</span>
                        {nicheSections[section]?.trim() && (
                          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Completado</span>
                        )}
                      </div>
                      {expandedSection === section ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSection === section && (
                      <div className="px-4 pb-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mt-3 mb-2">
                          Escribe aqui toda la informacion sobre "{section}" de tu negocio
                        </p>
                        <textarea
                          rows={5}
                          value={nicheSections[section] ?? ""}
                          onChange={e => handleNicheSection(section, e.target.value)}
                          placeholder={`Ej: Agrega aqui la informacion detallada sobre ${section.toLowerCase()}...`}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={saveNicheDocument}
                  disabled={savingNiche || Object.values(nicheSections).every(v => !v?.trim())}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNiche ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar como base de conocimiento
                </button>
                {nicheSaved && (
                  <div className="flex items-center gap-1.5 text-primary text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Guardado exitosamente
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Q&A */}
        {activeTab === "qa" && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm text-foreground mb-1">Preguntas y Respuestas</h2>
              <p className="text-xs text-muted-foreground mb-5">Agrega preguntas frecuentes y sus respuestas. El bot las usara para responder clientes</p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre del documento (opcional)</label>
                <input
                  type="text"
                  value={qaName}
                  onChange={e => setQaName(e.target.value)}
                  placeholder="Ej: FAQ Productos, Preguntas sobre envios..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-3 mb-5">
                {qaPairs.map((pair, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Par #{i + 1}
                      </span>
                      {qaPairs.length > 1 && (
                        <button
                          onClick={() => removeQAPair(i)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Pregunta
                        </label>
                        <input
                          type="text"
                          value={pair.question}
                          onChange={e => updateQAPair(i, "question", e.target.value)}
                          placeholder="Ej: ¿Cuales son los horarios de atencion?"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Respuesta
                        </label>
                        <textarea
                          rows={3}
                          value={pair.answer}
                          onChange={e => updateQAPair(i, "answer", e.target.value)}
                          placeholder="Ej: Atendemos de lunes a viernes de 9am a 6pm y sabados de 9am a 2pm."
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={addQAPair}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otra pregunta
                </button>
                <button
                  onClick={saveQADocument}
                  disabled={savingQA || qaPairs.every(p => !p.question.trim() || !p.answer.trim())}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingQA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Q&A ({qaPairs.filter(p => p.question.trim() && p.answer.trim()).length} pares)
                </button>
                {qaSaved && (
                  <div className="flex items-center gap-1.5 text-primary text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Guardado
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANALYZER */}
        {activeTab === "analyzer" && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">Analizador de Documentos con IA</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pega o sube cualquier texto con informacion de tu negocio. La IA lo organizara automaticamente en secciones estructuradas listas para entrenar al bot.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nicho (opcional)</label>
                  <select
                    value={analyzerNiche}
                    onChange={e => setAnalyzerNiche(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Sin nicho especifico</option>
                    {NICHES.map(n => (
                      <option key={n.value} value={n.label}>{n.emoji} {n.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre del documento (opcional)</label>
                  <input
                    type="text"
                    value={analyzerName}
                    onChange={e => setAnalyzerName(e.target.value)}
                    placeholder="Ej: Informacion del negocio..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setAnalyzerDragOver(true); }}
                onDragLeave={() => setAnalyzerDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setAnalyzerDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleAnalyzerFile(file);
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center mb-4 transition-all cursor-pointer ${
                  analyzerDragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                }`}
                onClick={() => document.getElementById("analyzer-file")?.click()}
              >
                <input id="analyzer-file" type="file" accept=".txt,.pdf" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleAnalyzerFile(file);
                }} />
                <Upload className={`w-5 h-5 mx-auto mb-1 ${analyzerDragOver ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs text-muted-foreground">Arrastra un archivo .txt o haz clic para subir</p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  O pega directamente el contenido aqui
                </label>
                <textarea
                  rows={8}
                  value={analyzerText}
                  onChange={e => setAnalyzerText(e.target.value)}
                  placeholder="Pega aqui toda la informacion de tu negocio: descripcion, productos, precios, horarios, politicas, etc. La IA organizara todo automaticamente..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Min. 20 caracteres</span>
                  <span className="text-xs text-muted-foreground">{analyzerText.length}/10,000 caracteres</span>
                </div>
              </div>

              <button
                onClick={runAnalysis}
                disabled={analyzing || analyzerText.trim().length < 20}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analizar y Organizar con IA
                  </>
                )}
              </button>
            </div>

            {/* Analysis result */}
            {analyzedResult && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Resultado del Analisis</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Revisalo antes de guardar</span>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{analyzedResult}</pre>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveAnalyzedDocument}
                    disabled={savingAnalyzed}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {savingAnalyzed ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar en base de conocimiento
                  </button>
                  <button
                    onClick={() => setAnalyzedResult(null)}
                    className="px-4 py-2.5 border border-border text-muted-foreground rounded-lg text-sm hover:bg-muted/30 transition-all"
                  >
                    Descartar
                  </button>
                  {analyzerSaved && (
                    <div className="flex items-center gap-1.5 text-primary text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Guardado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: DOCS */}
        {activeTab === "docs" && (
          <div className="bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Base de Conocimiento</h2>
              <span className="ml-auto text-xs text-muted-foreground">{documents.length} documento{documents.length !== 1 ? "s" : ""}</span>
            </div>

            {docsLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium text-foreground mb-1">Base de conocimiento vacia</h3>
                <p className="text-sm text-muted-foreground">
                  Usa las otras pestanas para agregar informacion de tu negocio
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{doc.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatBytes(doc.size)} &middot; {doc.fileType.toUpperCase()} &middot; {new Date(doc.createdAt).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate({ id: doc.id })}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info banner */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Como usa el bot tu informacion</h4>
              <p className="text-xs text-muted-foreground">
                Toda la informacion guardada se usa como contexto cuando el bot responde a tus clientes por WhatsApp. 
                Cuanto mas detallada sea la informacion, mejores y mas precisas seran las respuestas del bot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
