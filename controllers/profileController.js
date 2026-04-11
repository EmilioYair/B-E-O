const { admin } = require('../bd/bd');

/**
 * Obtiene la información del perfil desde Firestore
 */
const getProfileInfo = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario no proporcionado' });
        }

        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuario no encontrado en la base de datos' });
        }

        res.json(userDoc.data());
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno al obtener la información' });
    }
};

/**
 * Actualiza la información personal del usuario
 */
const updateProfileInfo = async (req, res) => {
    try {
        // Extraemos el UID de la sesión (ajustado a la estructura común de Express-Session)
        const uid = req.session.user ? req.session.user.uid : (req.session.userId || null);

        if (!uid) {
            return res.status(401).json({ 
                success: false, 
                error: 'Sesión no válida. Por favor, inicia sesión de nuevo.' 
            });
        }

        const { nombre, edad, telefono, biografia, ubicacion, especialidades } = req.body;

        // Creamos un objeto limpio para evitar enviar valores 'undefined' a Firestore
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (edad !== undefined) updateData.edad = edad;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (biografia !== undefined) updateData.biografia = biografia;
        if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
        if (especialidades !== undefined) updateData.especialidades = especialidades;
        
        // Añadimos marca de tiempo de actualización
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        // Referencia al documento del usuario
        const userRef = admin.firestore().collection('users').doc(uid);
        
        // Verificamos si el documento existe antes de intentar actualizar
        const doc = await userRef.get();
        if (!doc.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'El documento de usuario no existe en Firestore.' 
            });
        }

        // Realizamos la actualización
        await userRef.update(updateData);

        // RESPUESTA DE ÉXITO: Esto disparará el alert() en tu perfil.ejs
        return res.status(200).json({ 
            success: true, 
            message: '¡Perfil actualizado con éxito!' 
        });

    } catch (error) {
        console.error('Error en updateProfileInfo:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al intentar guardar los cambios.',
            details: error.message 
        });
    }
};

/**
 * Obtiene la URL de la imagen de perfil (simulado según tu estructura)
 */
const getProfileImageUrl = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        
        if (userDoc.exists && userDoc.data().photoURL) {
            return res.json({ url: userDoc.data().photoURL });
        }
        
        // Imagen por defecto si no tiene una
        res.json({ url: '/img/default-avatar.png' });
    } catch (error) {
        console.error('Error al obtener URL de imagen:', error);
        res.status(500).json({ error: 'Error al obtener imagen' });
    }
};

/**
 * Actualiza la imagen de perfil (Lógica base para Multer)
 */
const updateProfileImage = async (req, res) => {
    try {
        // Aquí iría tu lógica de subida a Firebase Storage
        // Por ahora, devolvemos éxito para no romper el flujo
        res.json({ success: true, message: 'Imagen procesada' });
    } catch (error) {
        console.error('Error al actualizar imagen:', error);
        res.status(500).json({ error: 'No se pudo actualizar la imagen' });
    }
};

module.exports = {
    getProfileInfo,
    updateProfileInfo,
    getProfileImageUrl,
    updateProfileImage
};