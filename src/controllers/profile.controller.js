const Profile = require('../models/profile.model');

// ─── GET /profiles/:userId ────────────────────────────────────
exports.getProfile = async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
        { user_id: req.params.userId },
        { $setOnInsert: { user_id: req.params.userId } },
        { upsert: true, new: true }
    );
    return res.json(profile);
};

// ─── PUT /profiles/:userId ────────────────────────────────────
exports.updateProfile = async (req, res) => {
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
};