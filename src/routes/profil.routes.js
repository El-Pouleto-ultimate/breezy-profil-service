const router = require('express').Router();
const profileCtrl = require('../controllers/profile.controller');
const notificationCtrl = require('../controllers/notification.controller');

// Profils
router.get('/profils/:userId', profileCtrl.getProfile);
router.put('/profils/:userId', profileCtrl.updateProfile);

// Notifications (accédées via gateway /api/notifications → profil-service /api/notifications/*)
router.get('/notifications', notificationCtrl.getNotifications);
router.put('/notifications/read-all', notificationCtrl.markAllAsRead);
router.put('/notifications/:id/read', notificationCtrl.markAsRead);
router.post('/notifications/internal', notificationCtrl.createNotification);

module.exports = router;