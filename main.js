const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { connectDB } = require('./config/database');

// Importar rutas API
const rutasProductos = require('./rutas/api/productos');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Vista'));

// Middlewares básicos
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/css', express.static(path.join(__dirname, 'estaticos/css')));
app.use('/js', express.static(path.join(__dirname, 'estaticos/js')));
app.use('/img', express.static(path.join(__dirname, 'estaticos/img')));

// ========================================
// RUTAS API REST (JSON)
// ========================================
app.use('/api/productos', rutasProductos);

// Ruta para crear usuario admin por defecto
app.get('/admin/crear-admin', async (req, res) => {
  try {
    const { Usuario } = require('./modelos');
    
    // Verificar si ya existe
    const adminExistente = await Usuario.findOne({
      where: { email: 'admin@datadream.com' }
    });

    if (adminExistente) {
      return res.send(`
        <h2>⚠️ Usuario admin ya existe</h2>
        <p><strong>Email:</strong> admin@datadream.com</p>
        <p><strong>Nombre:</strong> ${adminExistente.nombre} ${adminExistente.apellido}</p>
        <p><strong>Estado:</strong> ${adminExistente.activo ? 'Activo' : 'Inactivo'}</p>
        <p><a href="/admin/login">← Ir al Login</a></p>
      `);
    }

    // Crear usuario admin
    const adminUser = await Usuario.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@datadream.com',
      password: 'admin123',
      rol: 'super_admin',
      activo: true
    });

    res.send(`
      <h2>✅ Usuario administrador creado exitosamente</h2>
      <p><strong>ID:</strong> ${adminUser.id}</p>
      <p><strong>Email:</strong> ${adminUser.email}</p>
      <p><strong>Nombre:</strong> ${adminUser.nombre} ${adminUser.apellido}</p>
      <p><strong>Rol:</strong> ${adminUser.rol}</p>
      
      <h3>🔑 Credenciales para login:</h3>
      <p><strong>Email:</strong> admin@datadream.com</p>
      <p><strong>Password:</strong> admin123</p>
      
      <p><a href="/admin/login">→ Ir al Login</a></p>
    `);

  } catch (error) {
    console.error('Error al crear admin:', error);
    res.send(`
      <h2>❌ Error al crear usuario admin</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><a href="/admin/login">← Volver al Login</a></p>
    `);
  }
});

// Ruta de debug para ver qué datos llegan
app.post('/admin/debug/producto', (req, res) => {
  console.log('🐛 Debug - Datos recibidos:');
  console.log('Headers:', req.headers);
  console.log('Body completo:', req.body);
  console.log('Tipos de datos:');
  Object.keys(req.body).forEach(key => {
    console.log(`  ${key}: ${typeof req.body[key]} = "${req.body[key]}"`);
  });
  
  res.json({
    mensaje: 'Debug completado, revisa la consola del servidor',
    body: req.body,
    tipos: Object.keys(req.body).reduce((acc, key) => {
      acc[key] = typeof req.body[key];
      return acc;
    }, {})
  });
});

// Ruta para verificar estado de la base de datos
app.get('/admin/diagnostico', async (req, res) => {
  try {
    const { Usuario, Producto } = require('./modelos');
    
    // Verificar conexión
    await require('./config/database').sequelize.authenticate();
    
    // Contar registros
    const totalUsuarios = await Usuario.count();
    const totalProductos = await Producto.count();
    
    // Obtener algunos usuarios
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'activo', 'createdAt'],
      limit: 10
    });

    res.send(`
      <h1>Diagnóstico de Base de Datos</h1>
      <h2>✅ Conexión exitosa</h2>
      <p><strong>Tipo de BD:</strong> ${process.env.DB_TYPE || 'No configurado'}</p>
      <p><strong>Host:</strong> ${process.env.DB_HOST || 'No configurado'}</p>
      <p><strong>Base de datos:</strong> ${process.env.DB_NAME || 'No configurado'}</p>
      
      <h3>📊 Estadísticas</h3>
      <p><strong>Total usuarios:</strong> ${totalUsuarios}</p>
      <p><strong>Total productos:</strong> ${totalProductos}</p>
      
      <h3>👥 Usuarios registrados</h3>
      <table border="1" cellpadding="10">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Activo</th>
          <th>Creado</th>
        </tr>
        ${usuarios.map(user => `
          <tr>
            <td>${user.id}</td>
            <td>${user.nombre} ${user.apellido}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${user.activo ? 'Sí' : 'No'}</td>
            <td>${new Date(user.createdAt).toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>
      
      <p><a href="/admin/login">← Volver al Login</a></p>
    `);
    
  } catch (error) {
    res.send(`
      <h1>❌ Error de Base de Datos</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Tipo:</strong> ${error.name}</p>
      <h3>Configuración actual:</h3>
      <pre>
DB_TYPE: ${process.env.DB_TYPE || 'No configurado'}
DB_HOST: ${process.env.DB_HOST || 'No configurado'}  
DB_NAME: ${process.env.DB_NAME || 'No configurado'}
DB_USER: ${process.env.DB_USER || 'No configurado'}
      </pre>
      <p><a href="/admin/login">← Volver al Login</a></p>
    `);
  }
});

// Ruta para el dashboard
app.get('/admin/dashboard', async (req, res) => {
  console.log('🔧 Accediendo al dashboard...');
  
  try {
    const { Producto } = require('./modelos');
    
    let productos = [];
    try {
      productos = await Producto.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20
      });
      console.log(`📋 Productos encontrados: ${productos.length}`);
    } catch (dbError) {
      console.error('Error al obtener productos:', dbError);
      productos = [];
    }
    
    res.render('admin/dashboard', {
      titulo: 'Dashboard - DATA DREAM',
      usuario: { nombre: 'Admin', apellido: 'Sistema' },
      productos: productos,
      paginacion: {
        paginaActual: 1,
        totalPaginas: 1,
        tieneAnterior: false,
        tieneSiguiente: false,
        totalItems: productos.length
      },
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('❌ Error al renderizar dashboard:', error);
    res.status(500).send(`
      <h1>Error en Dashboard</h1>
      <p>Error: ${error.message}</p>
      <a href="/admin/login">Volver al Login</a>
    `);
  }
});

// Ruta para logout
app.get('/admin/logout', (req, res) => {
  res.redirect('/admin/login?mensaje=Sesión cerrada exitosamente');
});

// Ruta para formulario de nuevo producto
app.get('/admin/productos/nuevo', (req, res) => {
  try {
    res.render('admin/producto-form', {
      titulo: 'Nuevo Producto - DATA DREAM',
      usuario: { nombre: 'Admin', apellido: 'Sistema' },
      producto: null,
      accion: 'crear',
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error: req.query.error || null,
      errores: []
    });
  } catch (error) {
    console.error('Error al mostrar formulario nuevo producto:', error);
    res.redirect('/admin/dashboard?error=Error al cargar formulario');
  }
});

// Ruta para formulario de editar producto
app.get('/admin/productos/:id/editar', async (req, res) => {
  try {
    const { Producto } = require('./modelos');
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.redirect('/admin/dashboard?error=Producto no encontrado');
    }

    res.render('admin/producto-form', {
      titulo: 'Editar Producto - DATA DREAM',
      usuario: { nombre: 'Admin', apellido: 'Sistema' },
      producto,
      accion: 'editar',
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error: req.query.error || null,
      errores: []
    });

  } catch (error) {
    console.error('Error al mostrar formulario editar:', error);
    res.redirect('/admin/dashboard?error=Error al cargar producto');
  }
});

// Ruta POST para crear producto
app.post('/admin/productos', async (req, res) => {
  try {
    const { Producto } = require('./modelos');
    const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
    
    console.log('📝 Creando producto...');
    console.log('📊 Datos recibidos RAW:', req.body);
    console.log('📊 Tipos de datos:');
    console.log(`  - precio: "${precio}" (tipo: ${typeof precio})`);
    console.log(`  - stock: "${stock}" (tipo: ${typeof stock})`);
    
    // Validar y convertir datos con debugging
    let precioNum, stockNum;
    
    try {
      precioNum = parseFloat(precio);
      console.log(`🔢 Precio convertido: ${precioNum} (tipo: ${typeof precioNum})`);
      console.log(`🔍 isNaN(precio): ${isNaN(precioNum)}`);
    } catch (error) {
      console.error('❌ Error al convertir precio:', error);
      return res.redirect('/admin/productos/nuevo?error=Error al procesar el precio');
    }
    
    try {
      stockNum = parseInt(stock);
      console.log(`🔢 Stock convertido: ${stockNum} (tipo: ${typeof stockNum})`);
      console.log(`🔍 isNaN(stock): ${isNaN(stockNum)}`);
    } catch (error) {
      console.error('❌ Error al convertir stock:', error);
      return res.redirect('/admin/productos/nuevo?error=Error al procesar el stock');
    }

    // Validaciones adicionales con debugging
    if (!nombre || nombre.trim().length === 0) {
      console.log('❌ Validación fallida: nombre vacío');
      return res.redirect('/admin/productos/nuevo?error=El nombre del producto es requerido');
    }

    if (!categoria || !['ropa', 'accesorios'].includes(categoria)) {
      console.log('❌ Validación fallida: categoría inválida');
      return res.redirect('/admin/productos/nuevo?error=Debe seleccionar una categoría válida');
    }

    if (isNaN(precioNum)) {
      console.log('❌ Validación fallida: precio NaN');
      return res.redirect('/admin/productos/nuevo?error=El precio no es un número válido. Valor recibido: ' + precio);
    }
    
    if (precioNum < 0) {
      console.log('❌ Validación fallida: precio negativo');
      return res.redirect('/admin/productos/nuevo?error=El precio debe ser mayor o igual a 0. Valor: ' + precioNum);
    }

    if (isNaN(stockNum)) {
      console.log('❌ Validación fallida: stock NaN');
      return res.redirect('/admin/productos/nuevo?error=El stock no es un número válido. Valor recibido: ' + stock);
    }
    
    if (stockNum < 0) {
      console.log('❌ Validación fallida: stock negativo');
      return res.redirect('/admin/productos/nuevo?error=El stock debe ser mayor o igual a 0. Valor: ' + stockNum);
    }

    console.log('✅ Todas las validaciones pasaron');
    console.log(`✅ Valores finales: precio=${precioNum}, stock=${stockNum}`);
    
    const nuevoProducto = await Producto.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      categoria,
      precio: precioNum,
      stock: stockNum,
      imagen: '/img/default-product.png',
      color: color ? color.trim() : null,
      talla: talla ? talla.trim() : null,
      material: material ? material.trim() : null,
      activo: true
    });

    console.log('✅ Producto creado exitosamente:', {
      id: nuevoProducto.id,
      nombre: nuevoProducto.nombre,
      categoria: nuevoProducto.categoria,
      precio: nuevoProducto.precio,
      stock: nuevoProducto.stock
    });
    
    res.redirect('/admin/dashboard?mensaje=Producto creado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    console.error('Stack:', error.stack);
    
    // Manejar errores específicos de validación
    if (error.name === 'SequelizeValidationError') {
      const mensajes = error.errors.map(err => err.message).join(', ');
      return res.redirect('/admin/productos/nuevo?error=Errores de validación: ' + mensajes);
    }
    
    res.redirect('/admin/productos/nuevo?error=Error al crear producto. Revisa los datos ingresados.');
  }
});

// Ruta POST para actualizar producto
app.post('/admin/productos/:id', async (req, res) => {
  try {
    const { Producto } = require('./modelos');
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
    
    console.log('📝 Actualizando producto:', id);
    console.log('📊 Datos recibidos RAW:', req.body);
    console.log('📊 Tipos de datos:');
    console.log(`  - precio: "${precio}" (tipo: ${typeof precio})`);
    console.log(`  - stock: "${stock}" (tipo: ${typeof stock})`);
    
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.redirect('/admin/dashboard?error=Producto no encontrado');
    }

    // Validar y convertir datos con debugging
    let precioNum, stockNum;
    
    try {
      precioNum = parseFloat(precio);
      console.log(`🔢 Precio convertido: ${precioNum} (tipo: ${typeof precioNum})`);
      console.log(`🔍 isNaN(precio): ${isNaN(precioNum)}`);
    } catch (error) {
      console.error('❌ Error al convertir precio:', error);
      return res.redirect(`/admin/productos/${id}/editar?error=Error al procesar el precio`);
    }
    
    try {
      stockNum = parseInt(stock);
      console.log(`🔢 Stock convertido: ${stockNum} (tipo: ${typeof stockNum})`);
      console.log(`🔍 isNaN(stock): ${isNaN(stockNum)}`);
    } catch (error) {
      console.error('❌ Error al convertir stock:', error);
      return res.redirect(`/admin/productos/${id}/editar?error=Error al procesar el stock`);
    }

    // Validaciones adicionales con debugging
    if (!nombre || nombre.trim().length === 0) {
      console.log('❌ Validación fallida: nombre vacío');
      return res.redirect(`/admin/productos/${id}/editar?error=El nombre del producto es requerido`);
    }

    if (!categoria || !['ropa', 'accesorios'].includes(categoria)) {
      console.log('❌ Validación fallida: categoría inválida');
      return res.redirect(`/admin/productos/${id}/editar?error=Debe seleccionar una categoría válida`);
    }

    if (isNaN(precioNum)) {
      console.log('❌ Validación fallida: precio NaN');
      return res.redirect(`/admin/productos/${id}/editar?error=El precio no es un número válido. Valor recibido: "${precio}"`);
    }
    
    if (precioNum < 0) {
      console.log('❌ Validación fallida: precio negativo');
      return res.redirect(`/admin/productos/${id}/editar?error=El precio debe ser mayor o igual a 0. Valor: ${precioNum}`);
    }

    if (isNaN(stockNum)) {
      console.log('❌ Validación fallida: stock NaN');
      return res.redirect(`/admin/productos/${id}/editar?error=El stock no es un número válido. Valor recibido: "${stock}"`);
    }
    
    if (stockNum < 0) {
      console.log('❌ Validación fallida: stock negativo');
      return res.redirect(`/admin/productos/${id}/editar?error=El stock debe ser mayor o igual a 0. Valor: ${stockNum}`);
    }

    console.log('✅ Todas las validaciones pasaron');
    console.log(`✅ Valores finales: precio=${precioNum}, stock=${stockNum}`);

    await producto.update({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      categoria,
      precio: precioNum,
      stock: stockNum,
      color: color ? color.trim() : null,
      talla: talla ? talla.trim() : null,
      material: material ? material.trim() : null
    });

    console.log('✅ Producto actualizado exitosamente:', {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock
    });
    
    res.redirect('/admin/dashboard?mensaje=Producto actualizado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    console.error('Stack:', error.stack);
    
    // Manejar errores específicos de validación
    if (error.name === 'SequelizeValidationError') {
      const mensajes = error.errors.map(err => err.message).join(', ');
      return res.redirect(`/admin/productos/${req.params.id}/editar?error=Errores de validación: ${mensajes}`);
    }
    
    res.redirect(`/admin/productos/${req.params.id}/editar?error=Error al actualizar producto. Revisa los datos ingresados.`);
  }
});

// Ruta POST para login (consulta base de datos)
app.post('/admin/auth/login', async (req, res) => {
  try {
    const { Usuario } = require('./modelos');
    const { email, password } = req.body;
    
    console.log('🔐 Intento de login:', email);
    
    // Buscar usuario en la base de datos
    const usuario = await Usuario.findOne({ 
      where: { 
        email: email.toLowerCase(),
        activo: true 
      } 
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return res.redirect('/admin/login?error=Credenciales incorrectas');
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.redirect('/admin/login?error=Credenciales incorrectas');
    }

    console.log('✅ Login exitoso para:', usuario.email);
    res.redirect('/admin/dashboard?mensaje=Bienvenido ' + usuario.nombre + ' ' + usuario.apellido);
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.redirect('/admin/login?error=Error interno del servidor');
  }
});

// Ruta POST para registro (mejorada)
app.post('/admin/auth/registro', async (req, res) => {
  try {
    const { Usuario } = require('./modelos');
    const { nombre, apellido, email, password, confirmPassword } = req.body;
    
    console.log('📝 Intento de registro:', { nombre, apellido, email });
    
    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
      return res.redirect('/admin/register?error=Todos los campos son requeridos');
    }

    if (password !== confirmPassword) {
      return res.redirect('/admin/register?error=Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return res.redirect('/admin/register?error=La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect('/admin/register?error=Formato de email inválido');
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (usuarioExistente) {
      return res.redirect('/admin/register?error=El email ya está registrado');
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      rol: 'admin',
      activo: true
    });

    console.log('✅ Usuario registrado exitosamente:', {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido
    });

    res.redirect('/admin/login?mensaje=Cuenta creada exitosamente. Ya puedes iniciar sesión.');
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Manejar errores específicos de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const mensajes = error.errors.map(err => err.message).join(', ');
      return res.redirect('/admin/register?error=Datos inválidos: ' + mensajes);
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.redirect('/admin/register?error=El email ya está registrado');
    }
    
    res.redirect('/admin/register?error=Error al crear la cuenta. Intenta nuevamente.');
  }
});

// ========================================
// RUTAS FRONTEND CLIENTE (HTML Estático)
// ========================================
app.use(express.static('Vista', {
  ignore: ['/admin/*']
}));

app.get('/cliente/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/cliente/login/index.html'));
});

app.get('/cliente/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/cliente/home/index.html'));
});

app.get('/cliente/carrito', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/cliente/carrito/carrito.html'));
});

app.get('/cliente/ticket', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/cliente/ticket/tickets.html'));
});

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/welcome/index.html'));
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.path.startsWith('/api/')) {
    res.status(err.status || 500).json({
      exito: false,
      mensaje: err.message || 'Error interno del servidor'
    });
  } else {
    res.status(err.status || 500).send(`
      <h1>Error ${err.status || 500}</h1>
      <p>${err.message || 'Error interno del servidor'}</p>
      <a href="/">Volver al inicio</a>
    `);
  }
});

// Rutas no encontradas
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      exito: false,
      mensaje: 'Endpoint no encontrado'
    });
  } else {
    res.status(404).send(`
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <a href="/">Volver al inicio</a>
    `);
  }
});

// ========================================
// INICIALIZACIÓN DEL SERVIDOR
// ========================================

// Función para crear usuario admin automáticamente
const crearAdminPorDefecto = async () => {
  try {
    const { Usuario } = require('./modelos');
    
    // Verificar si ya existe
    const adminExistente = await Usuario.findOne({
      where: { email: 'admin@datadream.com' }
    });

    if (!adminExistente) {
      const adminUser = await Usuario.create({
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@datadream.com',
        password: 'admin123',
        rol: 'super_admin',
        activo: true
      });

      console.log('✅ Usuario admin por defecto creado:', {
        id: adminUser.id,
        email: adminUser.email
      });
    } else {
      console.log('ℹ️ Usuario admin ya existe:', adminExistente.email);
    }
  } catch (error) {
    console.error('❌ Error al crear admin por defecto:', error);
  }
};
const startServer = async () => {
  try {
    await connectDB();
    
    // Crear usuario admin por defecto si no existe
    await crearAdminPorDefecto();
    
    app.listen(PORT, () => {
      console.log(`
🚀 SERVIDOR DATA DREAM INICIADO

📍 URLs principales:
   🏠 Frontend:        http://localhost:${PORT}/
   🔧 Admin Login:     http://localhost:${PORT}/admin/login
   📊 Admin Dashboard: http://localhost:${PORT}/admin/dashboard
   🔍 Diagnóstico:     http://localhost:${PORT}/admin/diagnostico
   👤 Crear Admin:     http://localhost:${PORT}/admin/crear-admin
   🐛 Debug Formulario: http://localhost:${PORT}/admin/productos/debug

🔌 API REST:
   📦 /api/productos

🔑 Credenciales por defecto:
   Email: admin@datadream.com
   Password: admin123

🛠️  Puerto: ${PORT}
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();