const { v4: uuidv4 } = require('uuid');
const { admin, bucket } = require('../bd/bd');

const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.uid;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        // Generar nombre único para la imagen
        const fileName = `profiles/${userId}/${uuidv4()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Subir archivo a Firebase Storage
        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            }
        });

        // Guardar SOLO la ruta en Firestore (no la URL firmada)
        await admin.firestore().collection('users').doc(userId).update({
            profileImagePath: fileName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            message: 'Imagen de perfil actualizada con éxito',
            path: fileName
        });
    } catch (error) {
        console.error('Error al actualizar imagen de perfil:', error);
        res.status(500).json({
            error: 'Error al actualizar: ' + error.message
        });
    }
};

/**
 * Genera URL firmada para acceder a la imagen de perfil
 */
const getProfileImageUrl = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Obtener ruta del documento del usuario
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists || !userDoc.data().profileImagePath) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }

        const profileImagePath = userDoc.data().profileImagePath;
        const file = bucket.file(profileImagePath);

        // Generar URL firmada válida por 1 hora
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hora
        });

        res.status(200).json({ url });
    } catch (error) {
        console.error('Error al generar URL de imagen:', error);
        res.status(500).json({ error: 'Error al obtener imagen: ' + error.message });
    }
};

/**
 * Actualiza la información del perfil del usuario
 */
const updateProfileInfo = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { nombre, edad, telefono, biografia, ubicacion, especialidades } = req.body;

        console.log('Datos recibidos en updateProfileInfo:', req.body);

        // Validar que al menos un campo esté definido y no esté vacío
        const hasData = nombre || edad || telefono || biografia || ubicacion || especialidades;
        if (!hasData) {
            return res.status(400).json({ error: 'Debes completar al menos un campo' });
        }

        const updateData = {};
        
        if (nombre && typeof nombre === 'string' && nombre.trim()) {
            updateData.nombre = nombre.trim();
        }
        if (edad && !isNaN(parseInt(edad)) && parseInt(edad) > 0) {
            updateData.edad = parseInt(edad);
        } else if (edad === '') {
            // Permitir limpiar el campo
            updateData.edad = null;
        }
        if (telefono && typeof telefono === 'string' && telefono.trim()) {
            updateData.telefono = telefono.trim();
        }
        if (biografia && typeof biografia === 'string' && biografia.trim()) {
            updateData.biografia = biografia.trim();
        }
        if (ubicacion && typeof ubicacion === 'string' && ubicacion.trim()) {
            updateData.ubicacion = ubicacion.trim();
        }
        if (especialidades) {
            if (Array.isArray(especialidades)) {
                updateData.especialidades = especialidades.filter(e => typeof e === 'string' && e.trim()).map(e => e.trim());
            } else if (typeof especialidades === 'string' && especialidades.trim()) {
                updateData.especialidades = especialidades.split(',').map(e => e.trim()).filter(e => e);
            }
        }

        // Si no hay datos válidos después de validar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Debes proporcionar datos válidos para actualizar' });
        }

        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await admin.firestore().collection('users').doc(userId).update(updateData);

        console.log('Perfil actualizado exitosamente para usuario:', userId);
        res.status(200).json({
            message: 'Información del perfil actualizada con éxito',
            data: updateData
        });
    } catch (error) {
        console.error('Error completo al actualizar perfil:', error);
        res.status(500).json({ 
            error: 'Error al actualizar: ' + error.message,
            details: error.toString()
        });
    }
};

/**
 * Obtiene la información del perfil del usuario
 */
const getProfileInfo = async (req, res) => {
    try {
        const userId = req.params.userId;

        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(userDoc.data());
    } catch (error) {
        console.error('Error al obtener información del perfil:', error);
        res.status(500).json({ error: 'Error al obtener información: ' + error.message });
    }
};

module.exports = { updateProfileImage, getProfileImageUrl, updateProfileInfo, getProfileInfo };
