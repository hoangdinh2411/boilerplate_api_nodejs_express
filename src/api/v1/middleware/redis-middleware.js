const { client } = require('~/config/db/redis-connect');

const redisMiddleware = async (req, res, next) => {
  try {
    let ipUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let numRequest = await client.incr(ipUser);
    if (numRequest === 1) await client.expire(ipUser, 60);

    if (numRequest > 20)
      return res.status(503).json({
        status: 'error',
        message: 'Server is busy!',
      });
    next();
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      status: 'ERROR',
      message: 'SERVER ERROR!!!',
    });
  }
};

module.exports = redisMiddleware;
