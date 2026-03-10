const { db, admin, bucket } = require('../bd/bd');
const { collection, addDoc, serverTimestamp } = require("firebase/firestore");
const { v4: uuidv4 } = require('uuid'); // Necesitaremos uuid para nombres únicos

/**
 * Crea un nuevo servicio en la colección 'servicios'
 */
const createService = async (req, res) => {
    try {
        const { titulo, categoria, descripcion, precioBase, ubicacion } = req.body;
        const workerId = req.user.uid; // Obtenido del middleware de sesión

        if (!titulo || !categoria || !descripcion || !precioBase) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        let imagenUrl = "/images/DefaultService.png";

        // Lógica de subida a Firebase Storage
        if (req.file) {
            const fileName = `services/${uuidv4()}_${req.file.originalname}`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype }
            });

            // Hacer el archivo público (o generar URL firmada, aquí simplificamos)
            await file.makePublic();
            imagenUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }

        const docRef = await addDoc(collection(db, "servicios"), {
            titulo,
            categoria,
            descripcion,
            precioBase: parseFloat(precioBase),
            ubicacion,
            imagenUrl,
            workerId,
            activo: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
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

        const snapshot = await query.orderBy("createdAt", "desc").get();

        const services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(services);
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
};

module.exports = { createService, getServices };
