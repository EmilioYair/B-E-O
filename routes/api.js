const express = require('express');
const router = express.Router();
const { db } = require('../bd/bd');
const { collection, doc, setDoc } = require("firebase/firestore");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const verifySession = require('../middlewares/authMiddleware');
const { createService, getServices } = require('../controllers/serviceController');
const { addReview } = require('../controllers/reviewController');

// Reviews
router.post('/reviews', verifySession, addReview);

// Crear Servicio (Protegido)
router.post('/services', verifySession, upload.single('imagen'), createService);

// Obtener Servicios (Público)
router.get('/services', getServices);

// Registro de Usuario - Stub UI
router.post('/register', async (req, res) => {
    console.log("[STUB] Received registration request:", req.body);
    // Simulamos éxito instantáneo
    res.status(201).json({ message: 'Usuario registrado exitosamente (MODO UI)' });
});

module.exports = router;
