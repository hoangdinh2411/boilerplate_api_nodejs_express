const createError = require('http-errors');
const helper = require('@v1/helpers/auth-helper');
const UserModel = require('@v1/models/user-model');
const AdminModel = require('@v1/models/admin-model');
const TokenLogModel = require('@v1/models/token-log-model');

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

const validateUser = async (id) => {
  try {
    let user = await UserModel.findOne({ _id: id, status: 'active' });
    return user;
  } catch (error) {
    console.log('validateUser error:::', error);
    return null;
  }
};

const validateAdmin = async (id) => {
  try {
    let admin = await AdminModel.findOne({
      _id: id,
      status: 1,
      role: {
        $in: ['superadmin', 'admin'],
      },
    });
    return admin;
  } catch (error) {
    console.log('validateAdmin error:::', error);
    return null;
  }
};

const auth = {
  optional: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (token) {
      let { payload, err } = helper.validateToken({ token, type: 'token' });
      if (err) return next(createError.Unauthorized(err.message));
      let user = await validateUser(payload.id);
      if (!user) return next(createError.NotFound('user-not-found'));
      req.payload = payload;
    }
    next();
  },
  admin: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helper.validateToken({ token, type: 'admin' });
    if (err) return next(createError.Unauthorized(err.message));
    let admin = await validateAdmin(payload.id);
    if (!admin) return next(createError.NotFound('admin-not-found'));
    req.payload = payload;
    next();
  },
  user: async function (req, res, next) {
    let token = getTokenFromHeaders(req);
    if (!token) throw new Error(createError.Unauthorized());
    let { payload, err } = helper.validateToken({ token, type: 'token' });
    if (err) return next(createError.Unauthorized(err.message));
    let user = await validateUser(payload.id);
    if (!user) return next(createError.NotFound('user-not-found'));
    let options = {
      userId: payload.id,
    };
    payload.time && (options.time = payload.time);

    let checkTokenLog = await TokenLogModel.findOne(options).sort({
      createdAt: -1,
    });
    if (checkTokenLog && (!payload.time || !checkTokenLog.status))
      return next(createError.Unauthorized());
    req.payload = payload;
    next();
  },
};

module.exports = auth;
