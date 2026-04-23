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
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Upload, FileText, Trash2,
  Plus, Sparkles, BookOpen, MessageSquareQuote,
  ChevronDown, ChevronUp, Save, Loader2,
  CheckCircle, Tag, X, Database, Layers,
  Terminal as TerminalIcon, Cpu, Zap
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
    const content = `NICHO: ${niche?.label}\n\n` + filled.map(s => `## ${s}\n${nicheSections[s]?.trim()}`).join("\n\n");
    await uploadMutation.mutateAsync({
      data: { name: `${niche?.emoji} ${niche?.label} - Informacion del Negocio`, content, fileType: "txt" },
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
    { key: "nicho", label: "Módulos de Nicho", icon: Tag },
    { key: "qa", label: "Neural Pairs (Q&A)", icon: MessageSquareQuote },
    { key: "analyzer", label: "Analizador Cuántico", icon: Sparkles },
    { key: "docs", label: "Bóveda de Datos", icon: BookOpen },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              <Database className="w-3 h-3" />
              Base de Conocimiento
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
              Centro de <span className="gradient-cyber">Entrenamiento</span>
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-60">Gestiona la información que utiliza tu asistente.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl">
            <div className="text-right">
              <div className="text-sm font-black text-primary leading-none mt-1">{documents.length} DOCS</div>
            </div>
            <Database className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        {/* Futuristic Tabs */}
        <div className="flex gap-2 p-2 glass rounded-2xl overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-3 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 justify-center overflow-hidden ${
                  isSelected ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div layoutId="tab-glow" className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                )}
                <Icon className={`w-4 h-4 ${isSelected ? "text-primary drop-shadow-[0_0_5px_#00ff88]" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB: NICHO */}
          {activeTab === "nicho" && (
            <motion.div 
              key="nicho"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="glass-premium p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Selección de Módulo</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Optimiza la IA para tu sector específico</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-10">
                  {NICHES.map(n => (
                    <motion.button
                      key={n.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedNiche(n.value); setNicheSections({}); setExpandedSection(null); }}
                      className={`p-4 rounded-2xl text-center transition-all border relative overflow-hidden group ${
                        selectedNiche === n.value
                          ? "border-primary bg-primary/10 text-primary glow-green-sm"
                          : "border-white/5 bg-white/5 hover:border-white/20 text-muted-foreground"
                      }`}
                    >
                      <div className="text-3xl mb-3 transition-transform group-hover:scale-110">{n.emoji}</div>
                      <div className="text-[10px] font-black uppercase leading-tight tracking-tighter">{n.label}</div>
                      {selectedNiche === n.value && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-3 h-3 text-primary" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Secciones de Datos</h3>
                  {(NICHE_SECTIONS[selectedNiche] ?? []).map(section => (
                    <div key={section} className="glass border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/20">
                      <button
                        onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${nicheSections[section]?.trim() ? "text-primary bg-primary" : "text-white/20 bg-white/20"}`} />
                          <span className="text-xs font-bold text-foreground uppercase tracking-tight">{section}</span>
                        </div>
                        <AnimatePresence>
                          {nicheSections[section]?.trim() && (
                            <motion.span 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase"
                            >
                              Sync
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                      <AnimatePresence>
                        {expandedSection === section && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6"
                          >
                            <textarea
                              rows={5}
                              value={nicheSections[section] ?? ""}
                              onChange={e => handleNicheSection(section, e.target.value)}
                              placeholder={`Ingresa los parámetros de ${section.toLowerCase()}...`}
                              className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none scrollbar-hide font-mono"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <button
                    onClick={saveNicheDocument}
                    disabled={savingNiche || Object.values(nicheSections).every(v => !v?.trim())}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                  >
                    {savingNiche ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Integrar a la Bóveda
                  </button>
                  {nicheSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" />
                      Protocolo Exitoso
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Q&A */}
          {activeTab === "qa" && (
            <motion.div 
              key="qa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="glass-premium p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <MessageSquareQuote className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Neural Linkage</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vincula preguntas de usuario con respuestas lógicas</p>
                  </div>
                </div>

                <div className="mb-8 max-w-lg">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Namespace del Documento</label>
                  <input
                    type="text"
                    value={qaName}
                    onChange={e => setQaName(e.target.value)}
                    placeholder="Ej: FAQ_VENTAS_01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {qaPairs.map((pair, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={i} 
                      className="glass border-white/5 p-6 relative group"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                          Neural Pair #{i + 1}
                        </span>
                        {qaPairs.length > 1 && (
                          <button
                            onClick={() => removeQAPair(i)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Impulso (Pregunta)</label>
                          <input
                            type="text"
                            value={pair.question}
                            onChange={e => updateQAPair(i, "question", e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/30 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Respuesta (Output)</label>
                          <textarea
                            rows={3}
                            value={pair.answer}
                            onChange={e => updateQAPair(i, "answer", e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/30 focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addQAPair}
                    className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group"
                  >
                    <Plus className="w-8 h-8 mb-2 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Añadir Par Neuronal</span>
                  </motion.button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={saveQADocument}
                    disabled={savingQA || qaPairs.every(p => !p.question.trim() || !p.answer.trim())}
                    className="px-8 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                  >
                    {savingQA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sincronizar Q&A ({qaPairs.filter(p => p.question.trim() && p.answer.trim()).length} pares)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: ANALYZER */}
          {activeTab === "analyzer" && (
            <motion.div 
              key="analyzer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="glass-premium p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-40 h-40" />
                </div>

                <div className="flex items-start gap-5 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Analizador Cuántico IA</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      Inyecta datos en bruto. Nuestra red neuronal los filtrará, estructurará y organizará automáticamente en módulos de conocimiento.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Etiqueta de Nicho</label>
                    <select
                      value={analyzerNiche}
                      onChange={e => setAnalyzerNiche(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="">Selección Automática</option>
                      {NICHES.map(n => <option key={n.value} value={n.label}>{n.emoji} {n.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">ID del Documento</label>
                    <input
                      type="text"
                      value={analyzerName}
                      onChange={e => setAnalyzerName(e.target.value)}
                      placeholder="Ej: RAW_DATA_UPLOAD_01"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
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
                  className={`border-2 border-dashed rounded-3xl p-10 text-center mb-8 transition-all cursor-pointer group ${
                    analyzerDragOver ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(0,255,136,0.1)]" : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => document.getElementById("analyzer-file")?.click()}
                >
                  <input id="analyzer-file" type="file" accept=".txt,.pdf" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleAnalyzerFile(file);
                  }} />
                  <Upload className={`w-10 h-10 mx-auto mb-4 transition-transform group-hover:-translate-y-2 ${analyzerDragOver ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Inyectar Archivo de Texto</div>
                  <p className="text-xs text-muted-foreground mt-2 opacity-60">Soporta formatos TXT / RAW</p>
                </div>

                <div className="mb-10">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">O Pega el Código de Datos Directamente</label>
                  <textarea
                    rows={8}
                    value={analyzerText}
                    onChange={e => setAnalyzerText(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-foreground focus:border-primary/50 transition-all font-mono scrollbar-hide"
                    placeholder="Pega aquí la información desordenada de tu negocio..."
                  />
                  <div className="flex justify-between mt-2 px-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Quantum Buffer: 10,000 CHARS</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${analyzerText.length > 9000 ? "text-destructive" : "text-primary"}`}>
                      {analyzerText.length} / 10,000
                    </span>
                  </div>
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={analyzing || analyzerText.trim().length < 20}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-cyan-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando Algoritmos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Iniciar Análisis Estructural
                    </>
                  )}
                </button>
              </div>

              {/* Analysis result */}
              <AnimatePresence>
                {analyzedResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium p-8 border-primary/30 glow-green-sm"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Matriz Estructurada</h3>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic">Validar antes de guardar</span>
                    </div>
                    <div className="bg-black/60 border border-white/5 rounded-2xl p-6 mb-8 max-h-[400px] overflow-y-auto scrollbar-hide relative group">
                      <div className="absolute top-2 right-2 p-2 bg-white/5 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <TerminalIcon className="w-4 h-4 text-primary" />
                      </div>
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{analyzedResult}</pre>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={saveAnalyzedDocument}
                        disabled={savingAnalyzed}
                        className="px-8 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all glow-green disabled:opacity-50"
                      >
                        {savingAnalyzed ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit a la Bóveda
                      </button>
                      <button
                        onClick={() => setAnalyzedResult(null)}
                        className="px-6 py-4 border border-white/5 text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:text-foreground hover:bg-white/5 transition-all"
                      >
                        Rechazar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB: DOCS */}
          {activeTab === "docs" && (
            <motion.div 
              key="docs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-premium overflow-hidden"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Bóveda de Conocimiento</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Base de datos estructurada del bot</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-primary uppercase tracking-widest">
                  {documents.length} Entradas
                </div>
              </div>

              {docsLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="p-20 text-center opacity-30">
                  <FileText className="w-20 h-20 mx-auto mb-6" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Bóveda Vacía</h3>
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase">No se han detectado inyecciones de datos</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {documents.map((doc, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={doc.id} 
                      className="flex items-center gap-6 p-6 hover:bg-white/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-all">
                        <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">{doc.name}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">{formatBytes(doc.size)}</span>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">{doc.fileType.toUpperCase()}</span>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">
                            {new Date(doc.createdAt).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteMutation.mutate({ id: doc.id })}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-transparent hover:border-destructive/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Matrix Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="p-8 glass-premium border-primary/20 relative overflow-hidden group"
        >
          <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[200%] bg-primary/5 rotate-12 pointer-events-none group-hover:bg-primary/10 transition-all" />
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">Procesamiento de contexto IA</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Toda la información inyectada en la bóveda se procesa a través de algoritmos de recuperación RAG. 
                El bot utiliza estos fragmentos de datos para generar respuestas hiper-precisas con una latencia de milisegundos. 
                <span className="text-primary font-bold"> Para máxima eficiencia, mantén los datos estructurados y actualizados.</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
