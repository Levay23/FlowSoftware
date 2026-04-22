import { Router, type IRouter } from "express";
import { db, trainingDocumentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";
import { analyzeDocumentWithGroq } from "../services/groqClient";

const router: IRouter = Router();

router.get("/training/documents", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const docs = await db.select().from(trainingDocumentsTable)
    .where(eq(trainingDocumentsTable.userId, userId))
    .orderBy(trainingDocumentsTable.createdAt);

  res.json(docs);
});

router.post("/training/documents", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { name, content, fileType } = req.body;

  if (!name || content == null || !fileType) {
    res.status(400).json({ error: "Name, content and fileType are required" });
    return;
  }

  if (!["txt", "pdf", "qa", "niche"].includes(fileType)) {
    res.status(400).json({ error: "File type must be txt, pdf, qa or niche" });
    return;
  }

  const size = Buffer.byteLength(content, "utf8");

  const [doc] = await db.insert(trainingDocumentsTable).values({
    userId,
    name,
    content,
    fileType,
    size,
  }).returning();

  res.status(201).json(doc);
});

router.post("/training/analyze", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { content, niche, save, name } = req.body as {
    content?: string;
    niche?: string;
    save?: boolean;
    name?: string;
  };

  if (!content || typeof content !== "string" || content.trim().length < 20) {
    res.status(400).json({ error: "Content is required and must have at least 20 characters" });
    return;
  }

  const organized = await analyzeDocumentWithGroq(content, niche);

  if (save) {
    const docName = name || `Analisis IA${niche ? ` - ${niche}` : ""} - ${new Date().toLocaleDateString("es-ES")}`;
    const size = Buffer.byteLength(organized, "utf8");

    const [doc] = await db.insert(trainingDocumentsTable).values({
      userId,
      name: docName,
      content: organized,
      fileType: "txt",
      size,
    }).returning();

    res.json({ organized, document: doc });
    return;
  }

  res.json({ organized });
});

router.delete("/training/documents/:id", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [doc] = await db.delete(trainingDocumentsTable)
    .where(and(eq(trainingDocumentsTable.id, id), eq(trainingDocumentsTable.userId, userId)))
    .returning();

  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
