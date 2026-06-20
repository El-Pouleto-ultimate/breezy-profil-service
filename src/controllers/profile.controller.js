const Profile = require('../models/profile.model');

// ─── GET /profiles/:userId ────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
        { user_id: req.params.userId },
        { $setOnInsert: { user_id: req.params.userId } },
        { upsert: true, new: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('[Profil] getProfile error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};

// ─── PUT /profiles/:userId ────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (userId !== req.params.userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }

    const allowedFields = ['display_name', 'bio', 'avatar_url', 'banner_url'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.bio && updates.bio.length > 160) {
        return res.status(400).json({ error: { code: 'BIO_TOO_LONG', message: 'Bio max 160 caractères.' } });
    }

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