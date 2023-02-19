const express = require('express');
const NotificationController = require('@v1/controllers/user/notification-controller');
const router = express.Router();

router.get('/list', NotificationController.notifications);
router.get('/detail/:id', NotificationController.notification);
router.post('/read/:id', NotificationController.notificationRead);
router.post('/read/all', NotificationController.notificationReadAll);
router.get('/count/not/read', NotificationController.countNotRead);

module.exports = router;
