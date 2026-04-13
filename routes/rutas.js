const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/authMiddleware');
const { db } = require('../bd/bd'); 

router.get('/', (req, res) => {
    res.render('Pages/guest/inicio');
});


router.get('/dashboard', verifySession, (req, res) => {
    res.render('Pages/logged/dashboard');
});

router.get('/mensajes', verifySession, (req, res) => {
    res.render('Pages/logged/mensajes');
});

// Esta ruta carga el formulario para crear servicios
router.get('/postear', verifySession, (req, res) => {
    res.render('Pages/logged/crear-servicio');
});

router.get('/mis_servicios', verifySession, async (req, res) => {
    try {
        const userId = req.user.uid; 
        const serviciosSnapshot = await db.collection('servicios')
            .where('workerId', '==', userId)
            .get();

        const misServicios = [];
        serviciosSnapshot.forEach(doc => {
            misServicios.push({ id: doc.id, ...doc.data() });
        });

        res.render('Pages/logged/mis_servicios', { 
            servicios: misServicios,
            pendientes: [] 
        });
    } catch (error) {
        console.error("ERROR EN FIRESTORE:", error);
        res.status(500).send("Error al cargar datos");
    }
});

router.get('/perfil', verifySession, (req, res) => res.render('Pages/logged/perfil'));
router.get('/publicaciones', verifySession, (req, res) => res.render('Pages/logged/publicaciones'));
router.get('/settings', verifySession, (req, res) => res.render('Pages/logged/settings'));
router.get('/verify', verifySession, (req, res) => res.render('Pages/logged/verify'));


router.get('/ayuda', (req, res) => res.render('Pages/shared/ayuda'));
router.get('/buscar', (req, res) => res.render('Pages/shared/buscar'));
router.get('/como_funciona', (req, res) => res.render('Pages/shared/como_funciona'));
router.get('/contactanos', (req, res) => res.render('Pages/shared/contactanos'));
router.get('/encuentra', (req, res) => res.render('Pages/shared/encuentra'));
router.get('/exitos', (req, res) => res.render('Pages/shared/exitos'));
router.get('/pasos', (req, res) => res.render('Pages/shared/pasos'));
router.get('/politica_privacidad', (req, res) => res.render('Pages/shared/politica_privacidad'));
router.get('/recursos', (req, res) => res.render('Pages/shared/recursos'));
router.get('/seguridad', (req, res) => res.render('Pages/shared/seguridad'));
router.get('/sobre_nosotros', (req, res) => res.render('Pages/shared/sobre_nosotros'));
router.get('/terminos_condiciones', (req, res) => res.render('Pages/shared/terminos_condiciones'));

module.exports = router;