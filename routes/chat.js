const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/authMiddleware');
const { startChat, sendMessage } = require('../controllers/chatController');

// RUTA PRINCIPAL: Renderiza la página y pasa el objeto 'user' de la sesión
router.get('/', verifySession, (req, res) => {
    // Es vital que req.user contenga el uid o id de Firebase
    res.render('pages/mensajes', { user: req.user }); 
});

router.post('/start', verifySession, startChat);
router.post('/message', verifySession, sendMessage);

module.exports = router;