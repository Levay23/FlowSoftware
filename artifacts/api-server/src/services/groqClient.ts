import type { ChatbotConfig, TrainingDocument } from "@workspace/db";

export async function analyzeDocumentWithGroq(text: string, niche?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const nicheContext = niche ? `El negocio es del nicho: ${niche}.` : "";

  const systemPrompt = `Eres un experto en organizar informacion de negocios para entrenar bots de WhatsApp. 
${nicheContext}
Tu tarea es leer el documento proporcionado y extraer informacion organizada en estas secciones:

1. DESCRIPCION DEL NEGOCIO
2. PRODUCTOS O SERVICIOS (con precios si los hay)
3. PREGUNTAS FRECUENTES (genera al menos 5 Q&A basadas en el contenido)
4. POLITICAS Y CONDICIONES (envios, pagos, devoluciones, etc.)
5. HORARIOS Y CONTACTO
6. INFORMACION ADICIONAL

Para cada seccion incluye solo informacion presente o inferible del documento. 
Formato la respuesta como texto plano organizado, listo para ser usado como base de conocimiento del bot.
Si alguna seccion no aplica, omitela.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza y organiza la siguiente informacion:\n\n${text.slice(0, 8000)}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "Groq request failed";
    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Groq returned empty response");

  return content.trim();
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function buildContext(documents: TrainingDocument[]) {
  if (documents.length === 0) {
    return "No hay documentos de entrenamiento cargados todavía.";
  }

  return documents
    .slice(0, 8)
    .map((document, index) => `Documento ${index + 1}: ${document.name}\n${document.content.slice(0, 2500)}`)
    .join("\n\n---\n\n");
}

export async function generateGroqReply(params: {
  config: ChatbotConfig;
  trainingDocuments: TrainingDocument[];
  customerMessage: string;
  customerName: string;
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const messages: GroqMessage[] = [
    {
      role: "system",
      content: [
        params.config.systemPrompt,
        "Responde siempre en español claro y natural.",
        "Eres el asistente de WhatsApp del negocio. Responde breve, útil y con tono profesional.",
        "Si no sabes algo con seguridad, usa el mensaje de respaldo configurado o pide más datos.",
        `Mensaje de respaldo: ${params.config.fallbackMessage}`,
        `Base de conocimiento:\n${buildContext(params.trainingDocuments)}`,
      ].join("\n\n"),
    },
    {
      role: "user",
      content: `Cliente: ${params.customerName}\nMensaje: ${params.customerMessage}`,
    },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 350,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "Groq request failed";
    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned an empty response");
  }

  return content.trim();
}