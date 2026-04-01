const express = require('express');
const router = express.Router();
const { auth } = require('../bd/bd');

// Login: Create Firebase Session Cookie
router.post('/login', async (req, res) => {
    const idToken = req.body.idToken;
    if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized: missing idToken' });
    }
    
    try {
        // Create session cookie valid for 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        
        const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' };
        res.cookie('session', sessionCookie, options);
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
});

// Logout: Borra el cookie de sesión
router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/login');
});

module.exports = router;
