import admin from "firebase-admin";
import { logger } from "../lib/logger";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : null;

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info("Firebase Admin SDK initialized successfully");
  } catch (error) {
    logger.error({ error }, "Failed to initialize Firebase Admin SDK");
  }
} else {
  logger.warn("FIREBASE_SERVICE_ACCOUNT not provided. Firebase integration will be disabled.");
}

export async function createFirebaseUser(email: string, password?: string, displayName?: string) {
  if (!admin.apps.length) return null;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    logger.info({ uid: userRecord.uid }, "User created in Firebase successfully");
    return userRecord.uid;
  } catch (error: any) {
    // If user already exists in Firebase, just log it
    if (error.code === 'auth/email-already-exists') {
      logger.warn({ email }, "User already exists in Firebase");
      return null;
    }
    logger.error({ error, email }, "Failed to create user in Firebase");
    return null;
  }
}
