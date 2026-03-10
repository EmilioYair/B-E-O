const { auth } = require('../bd/bd');

/**
 * Middleware de autenticación y autorización
 * Verifica si el usuario tiene una sesión activa válida mediante cookies
 */
const verifySession = (req, res, next) => {
    // BYPASS para desarrollo enfocado en UI/Navegación
    console.log(`[AuthMiddleware] BYPASS: Usuario autenticado automáticamente (Mock)`);
    req.user = {
        uid: 'mock-user-123',
        email: 'test@beo.com',
        nombre: 'Usuario de Prueba'
    };
    next();
};

module.exports = verifySession;
