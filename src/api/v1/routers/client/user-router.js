const express = require('express');
const UserController = require('@v1/controllers/client/user-controller');
const router = express.Router();

router.post('/forgot_password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.get('/list', UserController.list);

module.exports = router;
