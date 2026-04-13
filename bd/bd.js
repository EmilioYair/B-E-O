require('dotenv').config();
const path = require('path');
const admin = require('firebase-admin');
const { initializeApp } = require("firebase/app"); // Mantener si lo usas en otros lados
const { getFirestore } = require("firebase/firestore"); // Mantener si lo usas en otros lados

// Configuración para cliente (Opcional, por si lo necesitas)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// --- CONFIGURACIÓN ADMIN SDK (BACKEND) ---
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
        console.error("Firebase Admin initialization failed:", error.message);
    }
}

// DEFINICIÓN DE INSTANCIAS PARA EL BACKEND
const db = admin.firestore(); // USAR EL DE ADMIN PARA LAS RUTAS
const auth = admin.auth();
const bucket = admin.storage().bucket();

console.log("Firebase and Admin SDK initialized successfully");

// Exportamos todo
module.exports = { app, db, admin, auth, bucket };