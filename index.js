require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3004; // Le profil-service tournera sur le port 3004 pour correspondre à l'infrastructure Docker

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`[Profil Service] Serveur démarré sur http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('[Profil Service] Erreur fatale de connexion DB:', err);
});