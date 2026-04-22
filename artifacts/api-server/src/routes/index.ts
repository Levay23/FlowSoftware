import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import contactsRouter from "./contacts";
import chatbotRouter from "./chatbot";
import whatsappRouter from "./whatsapp";
import trainingRouter from "./training";
import conversationsRouter from "./conversations";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(contactsRouter);
router.use(chatbotRouter);
router.use(whatsappRouter);
router.use(trainingRouter);
router.use(conversationsRouter);
router.use(adminRouter);

export default router;
