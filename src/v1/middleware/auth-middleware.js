const createError = require('http-errors');
const helperModule = require('@v1/modules/helper-module');

const getTokenFromHeaders = (req) => {
  const {
    headers: { authorization },
  } = req;
  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    let token = authorization.split(' ')[1];
    req.token = token;
    return token;
  }
  return null;
};

const auth = {
  optional: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (token) {
      let { payload, err } = helperModule.validateToken(token, 'token');
      if (err) return next(createError.Unauthorized(err.message));
      req.payload = payload;
    }
    next();
  },
  admin: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helperModule.validateToken(token, 'admin');
    if (err) return next(createError.Unauthorized(err.message));
    req.payload = payload;
    next();
  },
  user: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helperModule.validateToken(token, 'token');
    if (err) return next(createError.Unauthorized(err.message));
    req.payload = payload;
    next();
  },
};

module.exports = auth;
