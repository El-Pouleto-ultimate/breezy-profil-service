const Profile = require('../models/profile.model');

// ─── GET /profiles/:userId ────────────────────────────────────
// Récupère le profil d'un utilisateur. S'il n'existe pas encore en base,
// il est créé à la volée (via l'option upsert).
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
        { user_id: req.params.userId },
        // Si création (insert), on initialise l'ID utilisateur
        { $setOnInsert: { user_id: req.params.userId } },
        // upsert: true crée le document s'il n'existe pas. new: true renvoie le profil mis à jour/créé.
        { upsert: true, new: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('[Profil] getProfile error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};

// ─── PUT /profiles/:userId ────────────────────────────────────
// Met à jour les informations du profil d'un utilisateur.
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    // Sécurité : On vérifie que l'utilisateur connecté ne modifie que son propre profil
    if (userId !== req.params.userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }

    // Filtrage des champs autorisés à la modification
    const allowedFields = ['display_name', 'bio', 'avatar_url', 'banner_url', 'location'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Validation métier : la biographie ne doit pas dépasser 160 caractères
    if (updates.bio && updates.bio.length > 160) {
        return res.status(400).json({ error: { code: 'BIO_TOO_LONG', message: 'Bio max 160 caractères.' } });
    }

    // Enregistrement des modifications en base de données (avec upsert par sécurité)
    const profile = await Profile.findOneAndUpdate(
        { user_id: req.params.userId },
        { $set: updates },
        { upsert: true, new: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('[Profil] updateProfile error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};