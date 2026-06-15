const express = require('express');
const morgan = require('morgan');
const profilRoutes = require('./routes/profil.routes');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', profilRoutes);

module.exports = app;