const express = require('express');
const router = express.Router();
const { verifySession } = require('../middlewares/authMiddleware');
const { db } = require('../bd/bd'); 

router.get('/', (req, res) => {
    res.render('Pages/guest/inicio');
});

router.get('/login', (req, res) => res.render('Pages/guest/login'));
router.get('/registro', (req, res) => res.render('Pages/guest/registro'));


router.get('/dashboard', verifySession, async (req, res) => {
    try {
        const userId = req.user.uid;
        const userData = req.user; // Ya viene con esTrabajador y nombre desde el middleware
        
        let stats = { ganancias: '0.00', activos: 0, rating: '—' };
        let trabajos = [];
        let contrataciones = [];
        let misSolicitudes = [];

        if (userData.esTrabajador) {
            const servicesSnapshot = await db.collection('servicios').where('workerId', '==', userId).where('activo', '==', true).get();
            stats.activos = servicesSnapshot.size;
            
            const jobsSnapshot = await db.collection('contrataciones').where('workerId', '==', userId).get();
            jobsSnapshot.forEach(doc => trabajos.push({ id: doc.id, ...doc.data(), status: doc.data().status || 'Pendiente' }));
        } else {
            const contractsSnapshot = await db.collection('contrataciones').where('clientId', '==', userId).get();
            contractsSnapshot.forEach(doc => contrataciones.push({ id: doc.id, ...doc.data() }));

            const requestsSnapshot = await db.collection('solicitudes').where('clientId', '==', userId).get();
            requestsSnapshot.forEach(doc => misSolicitudes.push({ id: doc.id, ...doc.data() }));
        }

        res.render('Pages/logged/dashboard', { 
            user: userData,
            stats: stats,
            trabajos: trabajos,
            contrataciones: contrataciones,
            misSolicitudes: misSolicitudes
        });
    } catch (error) {
        console.error("Error al cargar Dashboard:", error);
        res.render('Pages/logged/dashboard', { user: { nombre: 'Usuario' }, stats: {}, trabajos: [], contrataciones: [], misSolicitudes: [] });
    }
});

router.get('/mensajes', verifySession, (req, res) => {
    res.render('Pages/logged/mensajes');
});

// Posteo condicional robusto (maneja booleanos y strings)
router.get('/postear', verifySession, (req, res) => {
    const user = req.user;
    const esTrabajador = user.esTrabajador === true || user.esTrabajador === 'true';

    console.log(`[Ruta /postear] Usuario: ${user.uid}, esTrabajador detected: ${esTrabajador} (raw: ${user.esTrabajador})`);

    if (esTrabajador) {
        res.render('Pages/logged/crear-servicio');
    } else {
        res.render('Pages/logged/publicar-solicitud');
    }
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
router.get('/perfil/:userId', (req, res) => res.render('Pages/logged/perfil', { publicUserId: req.params.userId }));
router.get('/search-users', (req, res) => res.render('Pages/shared/search-users', { query: req.query.q }));
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