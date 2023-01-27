const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const createError = require('http-errors');
const db = require('~/config/db/mongo-connect');
const redis = require('~/config/db/redis-connect');
const { logEvent } = require('~/plugins/helper-plugin');

// cải thiện hiệu năng
// const os = require("os");
// process.env.UV_THREADPOOL_SIZE = os.cpus().length - 2;

global.appRoot = path.resolve(__dirname);

require('dotenv').config();

const app = express();
const port = process.env.PORT;

db.connect();
redis.connect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan(':date[clf] :method :url :status :res[content-length] - :response-time ms'));
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    // filter: (req, res) => {},
  }),
);

const io = require('socket.io')(
  app.listen(port, async () => {
    // cronjobs.init();
    console.log('RESTful API server started on: ' + port);
  }),
  {
    serveClient: false,
    cors: {
      origins: '*',
      // credentials: true //Để bật cookie HTTP qua CORS
    },
  },
);
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token)
    jwt.verify(token, process.env.JWT_SECRET_USER, (err, decoded) => {
      if (err) return next(createError.Unauthorized(err.message));
      socket.join(decoded.id);
      // usersConnect[decoded.id] = usersConnect[decoded.id] || [];
      // usersConnect[decoded.id].push(socket.id);
      console.log('socket connected');
      next();
    });
  else {
    const error = new Error('not token');
    return next(error);
  }
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // delete usersConnect[socket.id];
  });
});

app.use(function (req, res, next) {
  req.io = io;
  // req.usersConnect = usersConnect;
  next();
});

app.use('/api', require('~/api'));
app.use(function (req, res, next) {
  next(createError.NotFound('This router does not exist.'));
});
app.use(function (err, req, res, next) {
  logEvent(`user_id:${req.payload?.id} --> ${req.method}:${req.url} --> err:${err.message}`);
  let status = err.status || 500;
  return res.status(status || 500).json({
    status: status || 500,
    error: err.message,
  });
});
module.exports = app;
