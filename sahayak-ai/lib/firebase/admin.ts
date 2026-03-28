import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // In Next.js, env variables with standard newlines might come through escaped
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error.stack);
    }
  }
};

initializeFirebaseAdmin();

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb, admin };
