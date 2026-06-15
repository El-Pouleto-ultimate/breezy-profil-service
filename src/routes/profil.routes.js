const router = require('express').Router();
const profileCtrl = require('../controllers/profile.controller');
const notificationCtrl = require('../controllers/notification.controller');

// Profils
router.get('/profiles/:userId', profileCtrl.getProfile);
router.put('/profiles/:userId', profileCtrl.updateProfile);

// Notifications
router.get('/notifications', notificationCtrl.getNotifications);
router.put('/notifications/read-all', notificationCtrl.markAllAsRead);
router.put('/notifications/:id/read', notificationCtrl.markAsRead);
router.post('/notifications/internal', notificationCtrl.createNotification);

module.exports = router;