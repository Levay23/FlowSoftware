import { Router, type IRouter } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/contacts", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { search, tag } = req.query as { search?: string; tag?: string };

  let query = db.select().from(contactsTable).where(eq(contactsTable.userId, userId));

  const conditions = [eq(contactsTable.userId, userId)];

  if (search) {
    conditions.push(
      sql`(${contactsTable.name} ILIKE ${'%' + search + '%'} OR ${contactsTable.phone} ILIKE ${'%' + search + '%'})`
    );
  }

  const contacts = await db.select().from(contactsTable)
    .where(and(...conditions))
    .orderBy(contactsTable.createdAt);

  let filtered = contacts;
  if (tag) {
    filtered = contacts.filter(c => c.tags.includes(tag));
  }

  res.json(filtered.map(c => ({
    ...c,
    tags: c.tags ?? [],
  })));
});

router.post("/contacts", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { name, phone, email, tags, notes } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }

  const [contact] = await db.insert(contactsTable).values({
    userId,
    name,
    phone,
    email: email ?? null,
    tags: tags ?? [],
    notes: notes ?? null,
  }).returning();

  res.status(201).json({ ...contact, tags: contact.tags ?? [] });
});

router.get("/contacts/:id", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [contact] = await db.select().from(contactsTable)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.userId, userId)))
    .limit(1);

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json({ ...contact, tags: contact.tags ?? [] });
});

router.patch("/contacts/:id", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { name, phone, email, tags, notes } = req.body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (tags !== undefined) updateData.tags = tags;
  if (notes !== undefined) updateData.notes = notes;

  const [contact] = await db.update(contactsTable)
    .set(updateData)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.userId, userId)))
    .returning();

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.json({ ...contact, tags: contact.tags ?? [] });
});

router.delete("/contacts/:id", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [contact] = await db.delete(contactsTable)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.userId, userId)))
    .returning();

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
