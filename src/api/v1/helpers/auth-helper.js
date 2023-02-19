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
            let refreshTokens = JSON.parse(await redis.get(decoded.id.toString())) || [];
            if (!refreshTokens.includes(token)) {
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
      if (type === 'refresh') expiresIn = '90d';
      let optionSecret = {
        token: process.env.JWT_SECRET_USER,
        refresh: process.env.JWT_SECRET,
        admin: process.env.JWT_SECRET_ADMIN,
      };

      let options = { expiresIn };
      let checkTokenLog = await TokenLogModel.findOne({
        userId: payload.id,
        status: true,
      }).sort({
        createdAt: -1,
      });
      if (checkTokenLog) payload.time = checkTokenLog.time;

      let token = jwt.sign(payload, optionSecret[type], options);
      if (type === 'refresh') {
        let refreshTokens = JSON.parse(await redis.get(payload.id.toString())) || [];
        refreshTokens.push(token);
        await redis.set(
          payload.id.toString(),
          JSON.stringify(refreshTokens),
          'EX',
          90 * 24 * 60 * 60,
        );
      }
      return token;
    } catch (error) {
      console.log('redis set token error:::', error);
      return createError.InternalServerError(error);
    }
  },
  tokenBlackList: async function ({ payload, token }) {
    try {
      let blackListToken = await redis.get(token.toString());
      if (blackListToken && blackListToken.toString() === 'token-black-list') {
        await redis.del(payload.id.toString());
        return Promise.reject(createError.Unauthorized('token-blacklisted'));
      }
      await redis.set(token.toString(), 'token-black-list', 'EX', 91 * 24 * 60 * 60);

      let refreshTokens = JSON.parse(await redis.get(payload.id.toString())) || [];
      refreshTokens = refreshTokens.filter(
        (refreshToken) => refreshToken.toString() !== token.toString(),
      );
      let newRefreshToken = await this.generateToken({
        payload,
        remember: false,
        type: 'refresh',
      });
      refreshTokens.push(newRefreshToken);
      await redis.set(
        payload.id.toString(),
        JSON.stringify(refreshTokens),
        'EX',
        90 * 24 * 60 * 60,
      );
      return newRefreshToken;
    } catch (error) {
      console.log('black list token error:::', error);
      return createError.InternalServerError(error);
    }
  },
};
