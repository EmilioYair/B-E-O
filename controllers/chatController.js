const { db, admin } = require('../bd/bd');
const {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    updateDoc,
    doc
} = require("firebase/firestore");

/**
 * Inicia o recupera un chat entre dos participantes
 */
const startChat = async (req, res) => {
    try {
        const { workerId } = req.body;
        const clientId = req.user.uid;

        if (!workerId) return res.status(400).json({ error: 'ID del trabajador requerido' });

        // Buscar si ya existe un chat entre ellos
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("participantes", "array-contains", clientId));
        const snapshot = await getDocs(q);

        let existingChat = null;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.participantes.includes(workerId)) {
                existingChat = { id: doc.id, ...data };
            }
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // Si no existe, crear uno nuevo
        const newChat = await addDoc(chatsRef, {
            participantes: [clientId, workerId],
            ultimoMensaje: "",
            updatedAt: serverTimestamp()
        });

        res.status(201).json({ id: newChat.id });
    } catch (error) {
        console.error("Error al iniciar chat:", error);
        res.status(500).json({ error: 'No se pudo iniciar el chat' });
    }
};

/**
 * Envía un mensaje en un chat específico
 */
const sendMessage = async (req, res) => {
    try {
        const { chatId, texto } = req.body;
        const senderId = req.user.uid;

        if (!chatId || !texto) return res.status(400).json({ error: 'Faltan datos' });

        const mensajesRef = collection(db, `chats/${chatId}/mensajes`);
        await addDoc(mensajesRef, {
            senderId,
            texto,
            fecha: serverTimestamp(),
            leido: false
        });

        // Actualizar el último mensaje en el doc del chat
        const chatDocRef = doc(db, "chats", chatId);
        await updateDoc(chatDocRef, {
            ultimoMensaje: texto,
            updatedAt: serverTimestamp()
        });

        res.status(200).json({ message: 'Mensaje enviado' });
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ error: 'No se pudo enviar el mensaje' });
    }
};

module.exports = { startChat, sendMessage };
