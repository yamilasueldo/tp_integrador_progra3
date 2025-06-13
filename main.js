const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Servir CSS, JS, IMG desde carpeta Estaticos
app.use('/css', express.static(path.join(__dirname, 'Estaticos/css')));
app.use('/js', express.static(path.join(__dirname, 'Estaticos/js')));
app.use('/img', express.static(path.join(__dirname, 'Estaticos/img')));

// Servir HTML de Vista
app.use(express.static('Vista'));

// Ruta principal que devuelve welcome
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vista/welcome/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});