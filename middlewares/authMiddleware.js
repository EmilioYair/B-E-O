const { auth, db } = require('../bd/bd');

/**
 * Middleware para adjuntar el usuario decodificado y sus datos de Firestore a res.locals.user
 * No bloquea la petición, solo provee el estado a las plantillas EJS
 */
const attachUser = async (req, res, next) => {
    const sessionCookie = req.cookies.session || '';
    res.locals.user = null; // Por defecto no hay usuario

    if (sessionCookie) {
        try {
            const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
            
            // 1. Obtener datos adicionales de Firestore para tener el rol (esTrabajador) y el nombre real en todas las páginas
            const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            // 2. Fusionar datos de Auth y Firestore
            const fullUser = {
                ...decodedClaims,
                ...userData,
                uid: decodedClaims.uid // Asegurar que el uid se mantenga
            };

            req.user = fullUser;
            res.locals.user = fullUser;
        } catch (error) {
            // Ignorar el error (sesión expirada o inválida), se queda como nulo
        }
    }
    next();
};

/**
 * Middleware de autenticación estricta
 * Verifica si el usuario tiene sesión, si no lo bloquea
 */
const verifySession = (req, res, next) => {
    console.log('verifySession - URL:', req.originalUrl, 'Usuario:', res.locals.user ? res.locals.user.uid : 'NONE');

    if (!res.locals.user) {
        // Redirige al login si es una página web, manda error si es API
        if (req.originalUrl.startsWith('/api')) {
            console.log('Unauthorized API call:', req.originalUrl);
            return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        return res.redirect('/login');
    }

    // Pasar el usuario a req.user para que el controlador lo pueda usar
    req.user = res.locals.user;
    next();
};

module.exports = { attachUser, verifySession };
