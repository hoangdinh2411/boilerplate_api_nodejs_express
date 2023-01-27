const express = require('express');
const app = express();
const redisMiddleware = require('@v1/middleware/redis-middleware');

app.use(redisMiddleware);
require('@v1/routers/index')(app);

module.exports = app;
