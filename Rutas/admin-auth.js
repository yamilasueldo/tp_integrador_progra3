// rutas/admin-auth.js
const express = require('express');
const ControladorAuth = require('../controladores/controladorAuth');
const { validarLogin, validarRegistro } = require('../middleware/validaciones');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /admin/auth/login - Iniciar sesión
router.post('/login', validarLogin, ControladorAuth.login);

// POST /admin/auth/registro - Registrar nuevo administrador
router.post('/registro', validarRegistro, ControladorAuth.registro);

// POST /admin/auth/logout - Cerrar sesión
router.post('/logout', ControladorAuth.logout);

// GET /admin/auth/verificar - Verificar estado de autenticación
router.get('/verificar', verificarToken, verificarAdmin, ControladorAuth.verificarAuth);

// POST /admin/auth/acceso-rapido - Botón de acceso rápido (solo desarrollo)
router.post('/acceso-rapido', ControladorAuth.accesoRapido);

module.exports = router;