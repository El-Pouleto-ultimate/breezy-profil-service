require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 4001; // Le profil-service tournera sur le port 4001 pour ne pas faire conflit !

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`[Profil Service] Serveur démarré sur http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('[Profil Service] Erreur fatale de connexion DB:', err);
});