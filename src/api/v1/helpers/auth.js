const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { redis } = require('~/api/database/redis-connect');
const TokenLogModel = require('@v1/models/token-log-model');

module.exports = {
  validateToken: function ({ token, type = 'token' }) {
    try {
      let result = {};
      let optionSecret = {
        token: process.env.JWT_SECRET_USER,
        refresh: process.env.JWT_SECRET,
        admin: process.env.JWT_SECRET_ADMIN,
      };
      jwt.verify(token, optionSecret[type], async function (err, decoded) {
        if (err) {
          result = { payload: null, err };
        } else {
          result = { payload: decoded };
          if (type === 'refresh') {
            let refreshToken = await redis.get(decoded.id.toString());
            if (refreshToken !== token) {
              result = { payload: null, err: createError.Unauthorized() };
            }
          }
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      return createError.Unauthorized(error.message);
    }
  },
  generateToken: async function ({ payload, remember = false, type = 'token' }) {
    try {
      let expiresIn = '2d';
      if (remember) expiresIn = '7d';
      if (type === 'refresh') expiresIn = '365d';
      let optionSecret = {
        token: process.env.JWT_SECRET_USER,
        refresh: process.env.JWT_SECRET,
        admin: process.env.JWT_SECRET_ADMIN,
      };

      let options = { expiresIn };
      let check_token_log = await TokenLogModel.findOne({
        userId: payload.id,
        status: true,
      }).sort({
        createdAt: -1,
      });
      if (check_token_log) payload.time = check_token_log.time;

      let token = jwt.sign(payload, optionSecret[type], options);
      if (type === 'refresh')
        await redis.set(payload.id.toString(), token, 'EX', 365 * 24 * 60 * 60);
      return token;
    } catch (error) {
      console.log('redis set token error:::', error);
      return createError.InternalServerError(error);
    }
  },
};
