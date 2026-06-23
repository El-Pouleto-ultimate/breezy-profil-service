const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const profilRoutes = require('./routes/profil.routes');

const app = express();

// CORS pour les requêtes cross-origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role', 'X-User-Username', 'x-internal-secret'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api', profilRoutes);

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('[profil-service] Erreur non gérée:', err.message);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erreur serveur.'
    }
  });
});

module.exports = app;