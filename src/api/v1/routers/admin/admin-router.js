const express = require('express');
const middleware = require('@v1/middlewares/auth-middleware');
const adminController = require('@v1/controllers/admin/admin-controller');
const router = express.Router();

adminController.initPassport();

router.get('/create/init', middleware.optional, adminController.createInit);
router.post('/login', adminController.login);

module.exports = router;
