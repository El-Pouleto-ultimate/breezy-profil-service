const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log('[Profil DB] Connexion MongoDB OK');
};

module.exports = connectDB;