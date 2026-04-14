const { admin, bucket } = require('../bd/bd');

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
        // Obtenemos el UID del middleware verifySession
        const uid = req.user ? req.user.uid : null;

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
 * Obtiene la URL de la imagen de perfil (Soporta Storage y Local)
 */
const getProfileImageUrl = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Preferimos la foto subida (profileImagePath) sobre la de Auth (photoURL)
            const photoUrl = userData.profileImagePath || userData.photoURL;
            
            if (photoUrl) {
                // Si es una URL externa (Google, etc.)
                if (photoUrl.startsWith('http')) {
                    return res.json({ url: photoUrl });
                }

                // Si es una ruta de Firebase Storage (e.g., profiles/UID/file.jpg)
                if (photoUrl.startsWith('profiles/') || photoUrl.includes('/')) {
                    try {
                        const file = bucket.file(photoUrl);
                        const [url] = await file.getSignedUrl({
                            version: 'v4',
                            action: 'read',
                            expires: Date.now() + 60 * 60 * 1000,
                        });
                        return res.json({ url });
                    } catch (storageError) {
                        console.error('Error al generar signed URL de perfil:', storageError);
                    }
                }

                // Si es un path local relativo
                return res.json({ url: `/Images/${photoUrl}` });
            }
        }
        
        // Imagen por defecto
        res.json({ url: '/Images/default-avatar.png' });
    } catch (error) {
        console.error('Error al obtener URL de imagen de perfil:', error);
        res.status(500).json({ error: 'Error al obtener imagen' });
    }
};

/**
 * Actualiza la imagen de perfil en Firebase Storage y Firestore
 */
const updateProfileImage = async (req, res) => {
    try {
        // Obtenemos el UID del middleware verifySession
        const uid = req.user ? req.user.uid : null;
        
        if (!uid) {
            return res.status(401).json({ success: false, error: 'No se encontró sesión de usuario' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
        }

        const fileName = `profiles/${uid}/${Date.now()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Subir buffer a Storage
        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            }
        });

        // Actualizar Firestore con el nuevo path
        await admin.firestore().collection('users').doc(uid).update({
            profileImagePath: fileName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ 
            success: true, 
            message: 'Imagen actualizada con éxito', 
            path: fileName 
        });

    } catch (error) {
        console.error('Error al actualizar imagen de perfil:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno al procesar la imagen',
            details: error.message 
        });
    }
};

module.exports = {
    getProfileInfo,
    updateProfileInfo,
    getProfileImageUrl,
    updateProfileImage
};