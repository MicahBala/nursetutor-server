import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount;

// 1. On Render (Production): Read credentials from the Environment Variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", error.message);
    }
}

// 2. On Local Machine (Development): Fall back to the physical JSON file
if (!serviceAccount) {
    const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
}

// 3. Prevent startup if no valid credentials exist
if (!serviceAccount) {
    throw new Error("❌ Firebase credentials missing! Set FIREBASE_SERVICE_ACCOUNT on Render or add serviceAccountKey.json locally.");
}

// 4. Initialize Firebase Admin SDK if not already running
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin initialized successfully.");
}

export default admin;