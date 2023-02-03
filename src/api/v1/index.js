const express = require('express');
const app = express();
const redisMiddleware = require('~/api/v1/middlewares/redis-middleware');

app.use(redisMiddleware);
require('@v1/routers/index')(app);

module.exports = app;
