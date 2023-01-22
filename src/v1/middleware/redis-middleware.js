const { incr } = require('@v1/modules/limiter-module');

const redisMiddleware = async (req, res, next) => {
  try {
    let ipUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let numRequest = await incr(ipUser);
    if (numRequest < 20)
      return res.status(503).json({
        status: 'error',
        message: 'Server is busy!',
        numRequest,
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
