const express = require('express');
const adminRouter = require('@v1/routers/admin/admin-router');
const mediaRouter = require('@v1/routers/admin/media-router');
const settingRouter = require('@v1/routers/admin/setting-router');
const router = express.Router();

router.use('/media', mediaRouter);
router.use('/setting', settingRouter);

module.exports = router;
