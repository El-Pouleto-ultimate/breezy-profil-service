const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient_user_id: { type: String, required: true },
    type: {
        type: String,
        enum: ['like', 'follow', 'mention', 'comment', 'reply'],
        required: true,
    },
    from_user_id: { type: String, required: true },
    from_username: { type: String, required: true },
    post_id: { type: String, default: null },
    is_read: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

notificationSchema.index({ recipient_user_id: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);