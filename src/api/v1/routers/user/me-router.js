const express = require('express');
const MeController = require('@v1/controllers/user/me-controller');
const router = express.Router();

router.get('/get', MeController.get);
router.put('/update', MeController.update);
router.patch('/update/password', MeController.updatePassword);
router.patch('/update/language', MeController.updateLanguage);
router.post('/device/register', MeController.registerDevice);
router.delete('/device/delete', MeController.deleteDevice);
router.patch('/update/notification', MeController.statusNotification);
router.delete('/logout', MeController.logout);

module.exports = router;
