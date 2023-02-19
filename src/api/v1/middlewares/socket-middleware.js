const createError = require('http-errors');
const jwt = require('jsonwebtoken');

module.exports = {
  socketMiddleware: (socket, next) => {
    const token = socket.handshake.auth.token;
    if (token)
      jwt.verify(token, process.env.JWT_SECRET_USER, (err, decoded) => {
        if (err) return next(createError.Unauthorized(err.message));
        socket.join(decoded.id);
        console.log('SOCKET CONNECTED');
        next();
      });
    else {
      const error = new Error('not token');
      return next(error);
    }
  },
};
