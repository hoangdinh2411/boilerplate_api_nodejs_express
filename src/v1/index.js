const express = require('express');
const app = express();

require('@v1/routers/index')(app);

module.exports = app;
