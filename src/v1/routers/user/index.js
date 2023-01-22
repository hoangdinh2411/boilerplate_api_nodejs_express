const express = require('express');
const meRouter = require('@v1/routers/user/me-router');
const mediaRouter = require('@v1/routers/user/media-router');
const verifyRouter = require('@v1/routers/user/verify-router');
const router = express.Router();

router.use('/me', meRouter);
router.use('/media', mediaRouter);
router.use('/verify', verifyRouter);

module.exports = router;
