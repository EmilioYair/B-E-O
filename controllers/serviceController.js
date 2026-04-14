const { v4: uuidv4 } = require('uuid');
const { admin, bucket } = require('../bd/bd');

/**
 * Crea un nuevo servicio en la colección 'servicios'
 */
const createService = async (req, res) => {
    try {
        const { titulo, categoria, descripcion, precioBase, ubicacion } = req.body;
        const workerId = req.user.uid;

        if (!titulo || !categoria || !descripcion || !precioBase) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        let imagenPath = null;

        if (req.file) {
            try {
                const fileName = `services/${workerId}/${uuidv4()}-${req.file.originalname}`;
                const file = bucket.file(fileName);

                await file.save(req.file.buffer, {
                    metadata: {
                        contentType: req.file.mimetype,
                    }
                });

                imagenPath = fileName;
            } catch (uploadError) {
                console.warn('Error al subir imagen a Firebase Storage:', uploadError.message);
                imagenPath = null;
            }
        }

        const docRef = await admin.firestore().collection("servicios").add({
            titulo,
            categoria,
            descripcion,
            precioBase: parseFloat(precioBase),
            ubicacion,
            imagenPath,
            workerId,
            activo: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: 'Servicio publicado con éxito',
            id: docRef.id
        });
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ error: 'Error al publicar el servicio: ' + error.message });
    }
};

/**
 * Helper para generar URLs firmadas
 */
const getSignedUrlHelper = async (filePath) => {
    if (!filePath) return null;
    try {
        const file = bucket.file(filePath);
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000,
        });
        return url;
    } catch (err) {
        console.error('Error generating signed URL:', err);
        return null;
    }
};

/**
 * Obtiene la lista de servicios filtrados o todos
 */
const getServices = async (req, res) => {
    try {
        const { categoria, ubicacion } = req.query;
        let query = admin.firestore().collection("servicios").where("activo", "==", true);

        if (categoria) {
            query = query.where("categoria", "==", categoria);
        }
        if (ubicacion) {
            query = query.where("ubicacion", "==", ubicacion);
        }

        const snapshot = await query.get();

        const services = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const imageUrl = await getSignedUrlHelper(data.imagenPath);
            services.push({ id: doc.id, ...data, imageUrl });
        }

        // Sort locally in descending order by createdAt to avoid Firestore index requirement
        services.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return dateB - dateA;
        });

        res.status(200).json(services);
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
};

/**
 * Obtiene los servicios del usuario actual
 */
const getMyServices = async (req, res) => {
    try {
        const workerId = req.user.uid;
        const snapshot = await admin.firestore().collection("servicios")
            .where("workerId", "==", workerId)
            .get();

        const services = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const imageUrl = await getSignedUrlHelper(data.imagenPath);
            services.push({ id: doc.id, ...data, imageUrl });
        }

        // Sort locally in descending order by createdAt to avoid Firestore index requirement
        services.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return dateB - dateA;
        });

        res.status(200).json(services);
    } catch (error) {
        console.error("Error al obtener mis servicios:", error);
        res.status(500).json({ error: 'Error al obtener tus servicios' });
    }
};

/**
 * Genera URL firmada para acceder a la imagen de un servicio
 */
const getServiceImageUrl = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const serviceDoc = await admin.firestore().collection('servicios').doc(serviceId).get();

        if (!serviceDoc.exists || !serviceDoc.data().imagenPath) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }

        const url = await getSignedUrlHelper(serviceDoc.data().imagenPath);
        res.status(200).json({ url });
    } catch (error) {
        console.error('Error al generar URL de imagen:', error);
        res.status(500).json({ error: 'Error al obtener imagen: ' + error.message });
    }
};

module.exports = { createService, getServices, getMyServices, getServiceImageUrl };
