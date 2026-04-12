const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/authMiddleware');
const { db } = require('../firebase'); // Asegúrate de que esta sea la ruta a tu config de Firebase

router.get('/mis_servicios', verifySession, async (req, res) => {
    try {
        // En tu consola vimos que el ID viene en req.user.uid
        const userId = req.user.uid; 
        
        console.log("Intentando buscar servicios para el workerId:", userId);

        // Hacemos la consulta
        const serviciosSnapshot = await db.collection('servicios')
            .where('workerId', '==', userId)
            .get();

        // Si la consulta está vacía, esto lo dirá en tu terminal
        console.log("Total encontrados:", serviciosSnapshot.size);

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
router.get('/postear', verifySession, (req, res) => res.render('Pages/logged/crear-servicio'));
router.get('/publicaciones', verifySession, (req, res) => res.render('Pages/logged/publicaciones'));
router.get('/settings', verifySession, (req, res) => res.render('Pages/logged/settings'));

// SHARED
router.get('/ayuda', (req, res) => res.render('Pages/shared/ayuda'));
router.get('/buscar', (req, res) => res.render('Pages/shared/buscar'));
router.get('/como_funciona', (req, res) => res.render('Pages/shared/como_funciona'));
router.get('/contactanos', (req, res) => res.render('Pages/shared/contactanos'));
router.get('/exitos', (req, res) => res.render('Pages/shared/exitos'));
router.get('/encuentra', (req, res) => res.render('Pages/shared/encuentra'));
router.get('/pasos', (req, res) => res.render('Pages/shared/pasos'));
router.get('/politica_privacidad', (req, res) => res.render('Pages/shared/politica_privacidad'));
router.get('/recursos', (req, res) => res.render('Pages/shared/recursos'));
router.get('/seguridad', (req, res) => res.render('Pages/shared/seguridad'));
router.get('/sobre_nosotros', (req, res) => res.render('Pages/shared/sobre_nosotros'));
router.get('/terminos_condiciones', (req, res) => res.render('Pages/shared/terminos_condiciones'));

module.exports = router;