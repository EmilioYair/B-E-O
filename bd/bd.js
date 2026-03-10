require('dotenv').config();
const path = require('path');
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const admin = require('firebase-admin');

// Configuración para cliente (Firebase SDK v9+)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuración para servidor (Firebase Admin SDK)
if (!admin.apps.length) {
    try {
        const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
        const fs = require('fs');

        if (fs.existsSync(serviceAccountPath)) {
            admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath)),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            console.log("Firebase Admin initialized with serviceAccountKey.json");
        } else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            console.log("Firebase Admin initialized with Application Default Credentials");
        }
    } catch (error) {
        console.error("Warning: Firebase Admin initialization failed. Server-side auth and storage may not work.", error.message);
        // No lanzamos error para permitir que el servidor inicie, pero las rutas protegidas fallarán
    }
}

const auth = admin.auth();
const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

console.log("Firebase and Admin SDK initialized successfully");

module.exports = { app, db, admin, auth, bucket };
