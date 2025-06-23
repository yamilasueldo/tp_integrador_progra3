// controladores/controladorAdminVista.js
const { Producto, Venta, ItemVenta } = require('../modelos');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class ControladorAdminVista {

  // GET /admin/dashboard - Mostrar dashboard principal
  static async mostrarDashboard(req, res) {
    try {
      console.log('🔧 Cargando dashboard simplificado...');
      
      // Obtener productos con paginación básica
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = 10;
      const offset = (pagina - 1) * limite;

      const { count, rows: productos } = await Producto.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: limite,
        offset: offset
      });

      const totalPaginas = Math.ceil(count / limite);

      const paginacion = {
        paginaActual: pagina,
        totalPaginas: totalPaginas || 1,
        tieneAnterior: pagina > 1,
        tieneSiguiente: pagina < totalPaginas,
        totalItems: count || 0
      };

      console.log(`📋 Productos encontrados: ${productos.length}`);

      res.render('admin/dashboard', {
        titulo: 'Dashboard - DATA DREAM',
        usuario: req.usuario || { nombre: 'Admin', apellido: 'Sistema' },
        productos: productos || [],
        paginacion,
        mensaje: req.query.mensaje || null,
        error: req.query.error || null
      });

    } catch (error) {
      console.error('❌ Error en dashboard:', error);
      
      // Renderizar dashboard con datos vacíos en caso de error
      res.render('admin/dashboard', {
        titulo: 'Dashboard - DATA DREAM',
        usuario: { nombre: 'Admin', apellido: 'Sistema' },
        productos: [],
        paginacion: {
          paginaActual: 1,
          totalPaginas: 1,
          tieneAnterior: false,
          tieneSiguiente: false,
          totalItems: 0
        },
        mensaje: null,
        error: 'Error al cargar productos'
      });
    }
  }

  // GET /admin/productos/nuevo - Mostrar formulario de alta de producto
  static async mostrarFormularioNuevo(req, res) {
    try {
      res.render('admin/producto-form', {
        titulo: 'Nuevo Producto - DATA DREAM',
        usuario: req.usuario,
        producto: null, // Nuevo producto
        accion: 'crear',
        categorias: [
          { valor: 'ropa', texto: 'Ropa' },
          { valor: 'accesorios', texto: 'Accesorios' }
        ]
      });
    } catch (error) {
      console.error('Error al mostrar formulario nuevo:', error);
      res.redirect('/admin/dashboard?error=Error al cargar formulario');
    }
  }

  // GET /admin/productos/:id/editar - Mostrar formulario de edición
  static async mostrarFormularioEditar(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.redirect('/admin/dashboard?error=Producto no encontrado');
      }

      res.render('admin/producto-form', {
        titulo: 'Editar Producto - DATA DREAM',
        usuario: req.usuario,
        producto,
        accion: 'editar',
        categorias: [
          { valor: 'ropa', texto: 'Ropa' },
          { valor: 'accesorios', texto: 'Accesorios' }
        ]
      });

    } catch (error) {
      console.error('Error al mostrar formulario editar:', error);
      res.redirect('/admin/dashboard?error=Error al cargar producto');
    }
  }

  // POST /admin/productos - Crear nuevo producto
  static async crearProducto(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        // Re-renderizar formulario con errores
        return res.render('admin/producto-form', {
          titulo: 'Nuevo Producto - DATA DREAM',
          usuario: req.usuario,
          producto: req.body,
          accion: 'crear',
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          errores: errores.array()
        });
      }

      const { nombre, descripcion, categoria, precio, stock, color, talla, material, peso, dimensiones } = req.body;
      
      // Procesar imagen si se subió
      let rutaImagen = '/img/default-product.png';
      if (req.file) {
        rutaImagen = `/uploads/productos/${req.file.filename}`;
      }

      const nuevoProducto = await Producto.create({
        nombre,
        descripcion,
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: rutaImagen,
        color,
        talla,
        material,
        peso: peso ? parseFloat(peso) : null,
        dimensiones: dimensiones || null,
        activo: true
      });

      res.redirect('/admin/dashboard?mensaje=Producto creado exitosamente');

    } catch (error) {
      console.error('Error al crear producto:', error);
      
      // Eliminar archivo subido si hay error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo:', unlinkError);
        }
      }

      res.render('admin/producto-form', {
        titulo: 'Nuevo Producto - DATA DREAM',
        usuario: req.usuario,
        producto: req.body,
        accion: 'crear',
        categorias: [
          { valor: 'ropa', texto: 'Ropa' },
          { valor: 'accesorios', texto: 'Accesorios' }
        ],
        error: 'Error al crear el producto: ' + error.message
      });
    }
  }

  // POST /admin/productos/:id - Actualizar producto existente
  static async actualizarProducto(req, res) {
    try {
      const { id } = req.params;
      const errores = validationResult(req);

      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.redirect('/admin/dashboard?error=Producto no encontrado');
      }

      if (!errores.isEmpty()) {
        return res.render('admin/producto-form', {
          titulo: 'Editar Producto - DATA DREAM',
          usuario: req.usuario,
          producto: { ...producto.dataValues, ...req.body },
          accion: 'editar',
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          errores: errores.array()
        });
      }

      const { nombre, descripcion, categoria, precio, stock, color, talla, material, peso, dimensiones } = req.body;
      
      // Procesar nueva imagen si se subió
      let rutaImagen = producto.imagen;
      if (req.file) {
        // Eliminar imagen anterior si no es la default
        if (producto.imagen && producto.imagen !== '/img/default-product.png') {
          try {
            const rutaAnterior = path.join(__dirname, '..', 'public', producto.imagen);
            await fs.unlink(rutaAnterior);
          } catch (unlinkError) {
            console.error('Error al eliminar imagen anterior:', unlinkError);
          }
        }
        rutaImagen = `/uploads/productos/${req.file.filename}`;
      }

      await producto.update({
        nombre,
        descripcion,
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: rutaImagen,
        color,
        talla,
        material,
        peso: peso ? parseFloat(peso) : null,
        dimensiones: dimensiones || null
      });

      res.redirect('/admin/dashboard?mensaje=Producto actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.redirect('/admin/dashboard?error=Error al actualizar producto');
    }
  }

  // POST /admin/productos/:id/alternar - Activar/Desactivar producto
  static async alternarEstadoProducto(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.redirect('/admin/dashboard?error=Producto no encontrado');
      }

      await producto.update({
        activo: !producto.activo
      });

      const mensaje = producto.activo ? 'Producto activado' : 'Producto desactivado';
      res.redirect(`/admin/dashboard?mensaje=${mensaje}`);

    } catch (error) {
      console.error('Error al alternar estado:', error);
      res.redirect('/admin/dashboard?error=Error al cambiar estado del producto');
    }
  }

  // POST /admin/productos/:id/eliminar - Eliminar producto (baja lógica)
  static async eliminarProducto(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.redirect('/admin/dashboard?error=Producto no encontrado');
      }

      // Baja lógica
      await producto.update({ activo: false });

      res.redirect('/admin/dashboard?mensaje=Producto eliminado (desactivado)');

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.redirect('/admin/dashboard?error=Error al eliminar producto');
    }
  }

  // GET /admin/login - Mostrar formulario de login
  static mostrarLogin(req, res) {
    // Si ya está autenticado, redirigir al dashboard
    if (req.cookies?.token) {
      return res.redirect('/admin/dashboard');
    }

    res.render('admin/login', {
      titulo: 'Login Admin - DATA DREAM',
      error: req.query.error || null,
      mensaje: req.query.mensaje || null
    });
  }

  // GET /admin/register - Mostrar formulario de registro
  static mostrarRegistro(req, res) {
    res.render('admin/register', {
      titulo: 'Registro Admin - DATA DREAM',
      error: req.query.error || null
    });
  }

  // GET /admin/logout - Cerrar sesión y redirigir
  static logout(req, res) {
    res.clearCookie('token');
    res.redirect('/admin/login?mensaje=Sesión cerrada exitosamente');
  }
}

module.exports = ControladorAdminVista;