const express = require('express');
const dotenv = require('dotenv');
const webRoutes = require('./routes/web.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const departmentsRoutes = require('./routes/departmentos.routes.js');
const documentsRoutes = require('./routes/documents.routes.js');
const userRoutes = require('./routes/user.routes.js');
const dashboardRoutes = require('./routes/dashboard.routes.js');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const db = require('./config/db.js');

dotenv.config();
const app = express();
app.use(express.json());
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'spnz-hostinger-fallback-session-secret';

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET no configurada. Se usara un fallback estable.');
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));

if (isProduction) {
  app.set('trust proxy', 1);
}

// Middleware para sesiones
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Middleware para inyectar el usuario de la sesión en las variables locales de EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Carpeta de archivos públicos
const staticDirCandidates = [
  path.join(__dirname, 'Public'),
  path.join(__dirname, 'public')
];

//archivos estaticos en ruta relativa
const staticDir = staticDirCandidates.find((dir) => fs.existsSync(dir));

if (!staticDir) {
  throw new Error('No se encontró la carpeta estática (Public o public).');
}

app.use(express.static(staticDir));

// Health check para monitoreo en hosting
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas
app.use('/', webRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Sistema funcionando correctamente' });
})
app.use('/api/auth', authRoutes);
app.use('/api/departamentos', departmentsRoutes);
app.use('/api/documentos', documentsRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware para manejar errores 404
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Error interno del servidor');
});

// Crea directorios necesarios en arranque para entornos limpios de deploy.
const requiredDirs = [
  path.join(__dirname, 'uploads', 'temp'),
];

requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Directorio de trabajo: ${process.cwd()}`);
  console.log(`Carpeta estatica activa: ${staticDir}`);
});
