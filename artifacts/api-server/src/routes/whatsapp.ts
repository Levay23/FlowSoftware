import { Router, type IRouter } from "express";
import { db, whatsappSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";
import { connectWhatsApp, disconnectWhatsApp, getWhatsAppProviderStatus, getWhatsAppContacts, forceReconnectWhatsApp } from "../services/whatsappProvider";

const router: IRouter = Router();

router.get("/whatsapp/status", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const provider = await getWhatsAppProviderStatus(userId);

  res.json({
    status: provider.status,
    phone: provider.phone,
    connectedAt: provider.connectedAt ? provider.connectedAt.toISOString() : null,
    provider: provider.provider,
    configured: provider.configured,
    qrCode: provider.qrCode,
    hasPreviousSession: provider.hasPreviousSession,
  });
});

router.post("/whatsapp/connect", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  res.json(await connectWhatsApp(userId));
});

router.post("/whatsapp/disconnect", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  await disconnectWhatsApp(userId);

  res.json({ success: true, message: "WhatsApp disconnected" });
});

router.post("/whatsapp/reconnect", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const result = await forceReconnectWhatsApp(userId);

  res.json({
    qrCode: result.qrCode,
    status: result.status,
    provider: result.provider,
    phone: result.phone,
    connectedAt: result.connectedAt,
    hasPreviousSession: false,
  });
});

router.get("/whatsapp/contacts", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const contacts = getWhatsAppContacts(userId);
  res.json(contacts);
});

export default router;
