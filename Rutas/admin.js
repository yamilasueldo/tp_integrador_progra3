// rutas/admin.js
const express = require('express');
const ControladorAdminVista = require('../controladores/controladorAdminVista');
const { verificarSesionAdmin, verificarAdmin } = require('../middleware/auth');
const { validarProducto, validarId } = require('../middleware/validaciones');
const { uploadProducto, manejarErroresUpload } = require('../middleware/upload');

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================

// GET /admin/login - Mostrar formulario de login
router.get('/login', ControladorAdminVista.mostrarLogin);

// GET /admin/register - Mostrar formulario de registro
router.get('/register', ControladorAdminVista.mostrarRegistro);

// GET /admin/logout - Cerrar sesión
router.get('/logout', ControladorAdminVista.logout);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(verificarSesionAdmin);
router.use(verificarAdmin);

// GET /admin/dashboard - Dashboard principal
router.get('/dashboard', ControladorAdminVista.mostrarDashboard);

// Ruta por defecto que redirige al dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// ========================================
// GESTIÓN DE PRODUCTOS
// ========================================

// GET /admin/productos/nuevo - Mostrar formulario de alta
router.get('/productos/nuevo', ControladorAdminVista.mostrarFormularioNuevo);

// GET /admin/productos/:id/editar - Mostrar formulario de edición
router.get('/productos/:id/editar', validarId, ControladorAdminVista.mostrarFormularioEditar);

// POST /admin/productos - Crear nuevo producto
router.post('/productos', 
  uploadProducto,
  manejarErroresUpload,
  validarProducto,
  ControladorAdminVista.crearProducto
);

// POST /admin/productos/:id - Actualizar producto
router.post('/productos/:id',
  validarId,
  uploadProducto,
  manejarErroresUpload,
  validarProducto,
  ControladorAdminVista.actualizarProducto
);

// POST /admin/productos/:id/alternar - Activar/Desactivar producto
router.post('/productos/:id/alternar',
  validarId,
  ControladorAdminVista.alternarEstadoProducto
);

// POST /admin/productos/:id/eliminar - Eliminar producto (baja lógica)
router.post('/productos/:id/eliminar',
  validarId,
  ControladorAdminVista.eliminarProducto
);

module.exports = router;