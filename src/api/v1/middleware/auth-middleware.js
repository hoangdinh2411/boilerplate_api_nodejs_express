const createError = require('http-errors');
const helperModule = require('@v1/helpers');
const UserModel = require('@v1/models/user-model');

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

const validateAccount = async (id) => {
  try {
    let user = await UserModel.findOne({ _id: id, status: 'active' });
    return user;
  } catch (error) {
    console.log('validateAccount error:::', error);
    return null;
  }
};

const auth = {
  optional: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (token) {
      let { payload, err } = helperModule.validateToken(token, 'token');
      if (err) return next(createError.Unauthorized(err.message));
      let user = await validateAccount(payload.id);
      if (!user) return next(createError.NotFound('user-not-found'));
      req.payload = payload;
    }
    next();
  },
  admin: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helperModule.validateToken(token, 'admin');
    if (err) return next(createError.Unauthorized(err.message));
    let user = await validateAccount(payload.id);
    if (!user) return next(createError.NotFound('user-not-found'));
    req.payload = payload;
    next();
  },
  user: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helperModule.validateToken(token, 'token');
    if (err) return next(createError.Unauthorized(err.message));
    let user = (req.payload = payload);
    next();
  },
};

module.exports = auth;
