// controladores/controladorAuth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');
const { validationResult } = require('express-validator');

class ControladorAuth {
  
  // POST /admin/auth/login - Login de administrador
  static async login(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: errores.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const usuario = await Usuario.findOne({ 
        where: { 
          email: email.toLowerCase(),
          activo: true 
        } 
      });

      if (!usuario) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const passwordValida = await usuario.compararPassword(password);
      if (!passwordValida) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secret_key_temporal',
        { expiresIn: '24h' }
      );

      // Configurar cookie del token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      res.json({
        exito: true,
        mensaje: 'Login exitoso',
        datos: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol
          },
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /admin/auth/registro - Registro de nuevo administrador
  static async registro(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: errores.array()
        });
      }

      const { nombre, apellido, email, password } = req.body;

      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (usuarioExistente) {
        return res.status(409).json({
          exito: false,
          mensaje: 'El email ya está registrado'
        });
      }

      // Crear nuevo usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email: email.toLowerCase(),
        password,
        rol: 'admin'
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Usuario registrado exitosamente',
        datos: {
          usuario: {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
          }
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores: error.errors.map(err => ({
            campo: err.path,
            mensaje: err.message
          }))
        });
      }

      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /admin/auth/logout - Cerrar sesión
  static async logout(req, res) {
    try {
      // Limpiar cookie del token
      res.clearCookie('token');
      
      res.json({
        exito: true,
        mensaje: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // GET /admin/auth/verificar - Verificar estado de autenticación
  static async verificarAuth(req, res) {
    try {
      res.json({
        exito: true,
        mensaje: 'Usuario autenticado',
        datos: {
          usuario: {
            id: req.usuario.id,
            nombre: req.usuario.nombre,
            apellido: req.usuario.apellido,
            email: req.usuario.email,
            rol: req.usuario.rol
          }
        }
      });
    } catch (error) {
      console.error('Error en verificar auth:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /admin/auth/acceso-rapido - Botón de acceso rápido para testing
  static async accesoRapido(req, res) {
    try {
      // Solo disponible en desarrollo
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({
          exito: false,
          mensaje: 'Endpoint no disponible'
        });
      }

      // Buscar el primer usuario admin disponible
      const usuario = await Usuario.findOne({ 
        where: { 
          activo: true,
          rol: ['admin', 'super_admin']
        } 
      });

      if (!usuario) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No hay usuarios administradores disponibles'
        });
      }

      // Generar token
      const token = jwt.sign(
        { 
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secret_key_temporal',
        { expiresIn: '24h' }
      );

      // Configurar cookie del token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        exito: true,
        mensaje: 'Acceso rápido exitoso',
        datos: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol
          },
          credenciales: {
            email: usuario.email,
            password: 'admin123' // Solo para mostrar al tester
          }
        }
      });

    } catch (error) {
      console.error('Error en acceso rápido:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ControladorAuth;