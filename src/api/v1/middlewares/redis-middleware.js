const createError = require('http-errors');
const { redis } = require('~/api/database/redis-connect');

const redisMiddleware = async (req, res, next) => {
  try {
    let ipUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ipWhiteList = await redis.get(ipUser.toString());
    if (ipWhiteList && ipWhiteList.toString() === 'ip-white-list')
      return next(createError.ServiceUnavailable('ip-white-list'));

    let numRequest = await redis.incrby(ipUser, 1);
    if (numRequest === 1) await redis.expire(ipUser, 60);

    if (numRequest > 20) {
      if (numRequest > 100) {
        await redis.set(ipUser.toString(), 'ip-white-list', 'EX', 7 * 24 * 60 * 60);
      }
      return next(createError.ServiceUnavailable('Server is busy!'));
    }
    next();
  } catch (error) {
    console.error(error);
    return next(createError.ServiceUnavailable('SERVER ERROR!!!'));
  }
};

module.exports = redisMiddleware;
