const express = require('express');
const router = express.Router();
const { db } = require('../bd/bd');
const { collection, addDoc } = require("firebase/firestore");

// Registro de Usuario
router.post('/register', async (req, res) => {
    console.log("Received registration request:", req.body);
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const docRef = await addDoc(collection(db, "users"), {
            nombre,
            email,
            password,
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', id: docRef.id });
    } catch (error) {
        console.error("Error al registrar usuario: ", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
