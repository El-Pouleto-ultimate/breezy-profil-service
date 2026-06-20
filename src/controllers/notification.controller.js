const Notification = require('../models/notification.model');

// ─── GET /notifications ───────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const skip = (page - 1) * limit;

    const filter = { recipient_user_id: userId };
    if (unread_only === 'true') filter.is_read = false;

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)),
        Notification.countDocuments(filter),
        Notification.countDocuments({ recipient_user_id: userId, is_read: false }),
    ]);

    return res.json({
        data: notifications,
        unread_count: unreadCount,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, hasNext: skip + notifications.length < total }
    });
  } catch (err) {
    console.error('[Notif] getNotifications error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};

// ─── PUT /notifications/:id/read ──────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const notif = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient_user_id: userId },
        { is_read: true },
        { new: true }
    );
    if (!notif) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    return res.json(notif);
  } catch (err) {
    console.error('[Notif] markAsRead error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};

// ─── PUT /notifications/read-all ──────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const result = await Notification.updateMany({ recipient_user_id: userId, is_read: false }, { is_read: true });
    return res.json({ updated_count: result.modifiedCount });
  } catch (err) {
    console.error('[Notif] markAllAsRead error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};

// ─── POST /notifications/internal ─────────────────────────────
exports.createNotification = async (req, res) => {
  try {
    if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
    }
    const { recipient_user_id, type, from_user_id, from_username, post_id } = req.body;

    if (recipient_user_id === from_user_id) return res.status(204).send();

    const notif = await Notification.create({ recipient_user_id, type, from_user_id, from_username, post_id });
    return res.status(201).json(notif);
  } catch (err) {
    console.error('[Notif] createNotification error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};