const { redis } = require('~/api/database/redis-connect');

const redisMiddleware = async (req, res, next) => {
  try {
    let ipUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let numRequest = await redis.incrby(ipUser, 1);
    if (numRequest === 1) await redis.expire(ipUser, 60);

    if (numRequest > 20)
      return res.status(503).json({
        status: 'error',
        message: 'Server is busy!',
      });
    next();
  } catch (error) {
    console.error(error);
    return res.status(503).json({
      status: 'ERROR',
      message: 'SERVER ERROR!!!',
    });
  }
};

module.exports = redisMiddleware;
