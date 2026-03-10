const { db, admin } = require('../bd/bd');
const {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    getDoc
} = require("firebase/firestore");

/**
 * Agrega una reseña a un servicio y actualiza el promedio del trabajador
 */
const addReview = async (req, res) => {
    try {
        const { servicioId, workerId, calificacion, comentario } = req.body;
        const clientId = req.user.uid;

        if (!servicioId || !workerId || !calificacion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // 1. Guardar la reseña
        await addDoc(collection(db, "resenas"), {
            servicioId,
            clientId,
            workerId,
            calificacion: parseInt(calificacion),
            comentario,
            timestamp: serverTimestamp()
        });

        // 2. Recalcular el promedio del trabajador
        const resenasRef = collection(db, "resenas");
        const q = query(resenasRef, where("workerId", "==", workerId));
        const snapshot = await getDocs(q);

        let totalCalificacion = 0;
        let numResenas = 0;
        snapshot.forEach(doc => {
            totalCalificacion += doc.data().calificacion;
            numResenas++;
        });

        const promedio = totalCalificacion / numResenas;

        // 3. Actualizar el perfil del usuario trabajador
        const userDocRef = doc(db, "users", workerId);
        await updateDoc(userDocRef, {
            promedioCalificacion: parseFloat(promedio.toFixed(1))
        });

        res.status(201).json({ message: 'Reseña agregada con éxito', nuevoPromedio: promedio });
    } catch (error) {
        console.error("Error al agregar reseña:", error);
        res.status(500).json({ error: 'No se pudo procesar la reseña' });
    }
};

module.exports = { addReview };
