const express = require('express');
const router = express.Router();

// GUEST

router.get('/', (req, res) => res.render('Pages/guest/inicio'));
router.get('/login', (req, res) => res.render('Pages/guest/login'));
router.get('/registro', (req, res) => res.render('Pages/guest/registro'));

// LOGGED


router.get('/dashboard', (req, res) => res.render('Pages/logged/dashboard'));
router.get('/mensajes', (req, res) => res.render('Pages/logged/mensajes'));
router.get('/mis_servicios', (req, res) => res.render('Pages/logged/mis_servicios'));
router.get('/perfil', (req, res) => res.render('Pages/logged/perfil'));
router.get('/postear', (req, res) => res.render('Pages/logged/postear'));
router.get('/publicaciones', (req, res) => res.render('Pages/logged/publicaciones'));
router.get('/settings', (req, res) => res.render('Pages/logged/settings'));

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