const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    display_name: { type: String, maxlength: 100, default: '' },
    bio: { type: String, maxlength: 160, default: '' },
    avatar_url: { type: String, default: '' },
    banner_url: { type: String, default: '' },
    location: { type: String, maxlength: 100, default: '' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

profileSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);