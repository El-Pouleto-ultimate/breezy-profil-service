const Notification = require('../models/notification.model');
const axios = require('axios');

// ─── GET /notifications ───────────────────────────────────────
// Récupère les notifications de l'utilisateur connecté de manière paginée.
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // Identité injectée par la Gateway
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const skip = (page - 1) * limit;

    // Filtre de base : uniquement les notifications destinées à l'utilisateur connecté
    const filter = { recipient_user_id: userId };
    if (unread_only === 'true') filter.is_read = false;

    // Exécution de requêtes parallèles pour optimiser le temps de réponse
    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)), // Tri du plus récent au plus ancien
        Notification.countDocuments(filter), // Nombre total filtré
        Notification.countDocuments({ recipient_user_id: userId, is_read: false }), // Nombre global non lu
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
// Marque une notification spécifique comme lue.
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    // updateOne/findOneAndUpdate avec vérification de l'ID ET du destinataire (sécurité pour éviter de lire les notifs d'autrui)
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
// Marque toutes les notifications non lues de l'utilisateur comme lues.
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
// Route interne (appelée par post-service et user-service) pour insérer une nouvelle notification.
exports.createNotification = async (req, res) => {
  try {
    // Vérification de sécurité interne
    if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
    }
    const { recipient_user_id, type, from_user_id, from_username, post_id } = req.body;

    // Éviter de s'auto-notifier (ex: si l'utilisateur aime son propre post)
    if (recipient_user_id === from_user_id) return res.status(204).send();

    // Règle métier (Fx15, Fx16) : les administrateurs et modérateurs ne reçoivent pas de notifications pour les likes/follows.
    if (type === 'like' || type === 'follow') {
        try {
            // Requête synchrone vers l'auth-service pour obtenir le rôle réel en base de données (source de vérité)
            const roleResp = await axios.get(
                `${process.env.AUTH_SERVICE_URL}/auth/internal/users/${recipient_user_id}/role`,
                { headers: { 'x-internal-secret': process.env.INTERNAL_SECRET }, timeout: 2000 }
            );
            const realRole = roleResp.data?.role;
            if (realRole === 'moderator' || realRole === 'admin') {
                return res.status(204).send(); // Pas de création de notif
            }
        } catch (e) {
            // Fallback si auth-service est down : on vérifie la valeur "recipient_role" passée en paramètre
            const fallbackRole = req.body.recipient_role;
            if (fallbackRole === 'moderator' || fallbackRole === 'admin') {
                return res.status(204).send();
            }
        }
    }

    // Création en base MongoDB
    const notif = await Notification.create({ recipient_user_id, type, from_user_id, from_username, post_id });
    return res.status(201).json(notif);
  } catch (err) {
    console.error('[Notif] createNotification error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur.' } });
  }
};