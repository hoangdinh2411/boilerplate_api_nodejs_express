const express = require('express');
const VerifyController = require('@v1/controllers/user/verify-controller');
const router = express.Router();

router.get('/email', VerifyController.email);
router.post('/email-verify', VerifyController.verifyEmail);

module.exports = router;
