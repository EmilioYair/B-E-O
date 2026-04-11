const express = require('express');
const router = express.Router();
const { admin } = require('../bd/bd');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { verifySession } = require('../middlewares/authMiddleware');
const { createService, getServices, getMyServices, getServiceImageUrl } = require('../controllers/serviceController');
const { updateProfileImage, getProfileImageUrl, updateProfileInfo, getProfileInfo } = require('../controllers/profileController');
const { addReview } = require('../controllers/reviewController');

// Test endpoint (debug)
router.get('/test', (req, res) => {
    res.json({ status: 'API working', timestamp: new Date().toISOString() });
});

// Reviews
router.post('/reviews', verifySession, addReview);

// Crear Servicio (Protegido)
router.post('/services', verifySession, upload.single('imagen'), createService);

// Obtener Servicios (Público)
router.get('/services', getServices);

// Obtener Servicios del Usuario (Protegido)
router.get('/my-services', verifySession, getMyServices);

// Actualizar Imagen de Perfil (Protegido)
router.put('/profile/image', verifySession, upload.single('avatar'), updateProfileImage);

// Obtener URL firmada de image de perfil (Público - la ruta está en Storage)
router.get('/profile/:userId/image-url', getProfileImageUrl);
// Obtener información del perfil del usuario
router.get('/profile/:userId/info', getProfileInfo);
// Obtener URL firmada de imagen de servicio (Público - la ruta está en Storage)
router.get('/services/:serviceId/image-url', getServiceImageUrl);

// Actualizar información del perfil (Protegido)
router.post('/profile/info', verifySession, async (req, res) => {
    try {
        const { nombre, edad, telefono, biografia, ubicacion, especialidades } = req.body;
        const userId = req.session.userId; // O como obtengas el ID del usuario de la sesión

        // AQUÍ VA TU LÓGICA DE BASE DE DATOS (Ejemplo con una DB imaginaria)
        // await db.users.update(userId, { nombre, edad, telefono, biografia, ubicacion, especialidades });

        // ESTO ES LO MÁS IMPORTANTE: La respuesta JSON que espera tu JavaScript
        res.status(200).json({ 
            success: true, 
            message: 'Información guardada correctamente' 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor', 
            details: error.message 
        });
    }
});

// Registro de Usuario - Firestore Integration
router.post('/register', async (req, res) => {
    try {
        const { uid, nombre, email, esTrabajador } = req.body;
        
        if (!uid || !email) {
            return res.status(400).json({ error: 'Faltan datos requeridos (uid, email)' });
        }
        
        await admin.firestore().collection("users").doc(uid).set({
            nombre: nombre || '',
            email: email,
            esTrabajador: esTrabajador || false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.status(201).json({ message: 'Usuario registrado exitosamente en Firestore' });
    } catch (error) {
        console.error('Error registry user to Firestore:', error);
        res.status(500).json({ error: 'Error al registrar en la base de datos' });
    }
});

module.exports = router;
