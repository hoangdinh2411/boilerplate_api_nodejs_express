const express = require('express');
const authRouter = require('@v1/routers/client/auth-router');
const userRouter = require('@v1/routers/client/user-router');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);

module.exports = router;
