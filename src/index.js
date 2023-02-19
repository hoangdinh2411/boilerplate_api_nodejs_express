const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const createError = require('http-errors');
const db = require('~/api/database/mongo-connect');
const { logEvent } = require('@v1/helpers/log-helper');
const app = express();
const server = require('http').createServer(app);
// const SocketModule = require('@v1/modules/socket-module');
// const { socketMiddleware } = require('@v1/middlewares/socket-middleware');
// const cronjob = require('@v1/cronjobs');
// const io = require('socket.io')(server, {
//   serveClient: false,
//   cors: {
//     origins: '*',
//     // credentials: true //Để bật cookie HTTP qua CORS
//   },
// });

// cải thiện hiệu năng
// const os = require("os");
// process.env.UV_THREADPOOL_SIZE = os.cpus().length - 2;

global.__appRoot = path.resolve(__dirname);
// global.__io = io;

require('dotenv').config();
const { redis } = require('~/api/database/redis-connect');

const port = process.env.PORT || 9999;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan(':date[clf] :method :url :status :res[content-length] - :response-time ms'));
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    // filter: (req, res, next) => {},
  }),
);

// global.__io.use(socketMiddleware);
// global.__io.on('connection', SocketModule.connection);

app.use('/api', require('~/api'));
app.use('/media', require('@v1/routers/media/index'));
app.use(function (req, res, next) {
  next(createError.NotFound('This router does not exist.'));
});
app.use(function (err, req, res, next) {
  let status = err.status || 500;
  status === 400 &&
    logEvent(
      `user_id:${req.payload?.id} --> ${req.method}:${req.url} ${status} --> err:${err.message}`,
    );
  return res.status(status).json({
    status,
    error: err.message,
  });
});

app.listen(port, async () => {
  await db.connect();
  // cronjob.init();
  console.log('RESTFUL API server started on: ' + port);
});
