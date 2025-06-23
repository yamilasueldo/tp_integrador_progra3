// middleware/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.session?.token;

    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporal');
    
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido o usuario desactivado'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token inválido'
    });
  }
};

// Middleware para vistas EJS - redirige a login si no está autenticado
const verificarSesionAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.session?.token;

    if (!token) {
      return res.redirect('/admin/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporal');
    
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      res.clearCookie('token');
      return res.redirect('/admin/login');
    }

    req.usuario = usuario;
    res.locals.usuario = usuario; // Disponible en las vistas EJS
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/admin/login');
  }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (!req.usuario || (req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin')) {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Acceso denegado. Se requieren permisos de administrador'
      });
    } else {
      return res.redirect('/admin/login?error=permisos');
    }
  }
  next();
};

module.exports = {
  verificarToken,
  verificarSesionAdmin,
  verificarAdmin
};