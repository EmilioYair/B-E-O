const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/authMiddleware');
const { startChat, sendMessage } = require('../controllers/chatController');

// Iniciar un chat (Protegido)
router.post('/start', verifySession, startChat);

// Enviar un mensaje (Protegido)
router.post('/message', verifySession, sendMessage);

module.exports = router;
