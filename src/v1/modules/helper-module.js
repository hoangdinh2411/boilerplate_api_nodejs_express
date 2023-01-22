const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { client } = require('~/config/db/redis-connect');

module.exports = {
  validateToken: function (token, type = 'token') {
    let result = {};
    let optionSecret = {
      token: process.env.JWT_SECRET_USER,
      refresh: process.env.JWT_SECRET,
      admin: process.env.JWT_SECRET_ADMIN,
    };
    jwt.verify(token, optionSecret[type], async function (err, decoded) {
      console.log('🚀 ~ file: helper-module.js:14 ~ err, decoded', err, decoded);
      if (err) {
        result = { payload: null, err };
      } else {
        result = { payload: decoded };
        if (type === 'refresh') {
          let refreshToken = await client.get(decoded.id.toString());
          if (refreshToken !== token) {
            result = { payload: null, err: createError.Unauthorized() };
          }
        }
      }
    });

    return result;
  },
  generateToken: async function (payload, member = false, type = 'token') {
    let expiresIn = '2d';
    if (member) expiresIn = '7d';
    if (type === 'refresh') expiresIn = '365d';
    let optionSecret = {
      token: process.env.JWT_SECRET_USER,
      refresh: process.env.JWT_SECRET,
      admin: process.env.JWT_SECRET_ADMIN,
    };
    let options = { expiresIn };
    let token = jwt.sign(payload, optionSecret[type], options);
    try {
      if (type === 'refresh')
        await client.set(payload.id.toString(), token, { EX: 365 * 24 * 60 * 60 });
    } catch (error) {
      console.log('redis set token error:::', error);
      return createError.InternalServerError();
    }

    return token;
  },
};
