const express = require('express');
const router = express.Router();
const { auth } = require('../bd/bd');

// Login: Stub para desarrollo UI
router.post('/login', async (req, res) => {
    // No verificamos nada, solo simulamos éxito
    const options = { maxAge: 1000 * 60 * 60, httpOnly: true, secure: false };
    res.cookie('session', 'mock-session-cookie', options);
    res.status(200).json({ status: 'success' });
});

// Logout: Borra el cookie de sesión
router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/login');
});

module.exports = router;
