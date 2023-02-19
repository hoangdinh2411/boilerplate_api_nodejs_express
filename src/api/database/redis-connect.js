const Redis = require('ioredis');
require('dotenv').config();
//redis cloud
const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  // db: 0, // Defaults to 0
});

//redis local
// const redis = new Redis();

redis
  .ping()
  .then(function () {
    console.log('REDIS CONNECT SUCCESSFULLY!!!');
    // redis.psubscribe('__keyevent@0__:expired');
    // redis.on('pmessage', async (pattern, chanel, message) => {});
  })
  .catch(function (error) {
    console.log('REDIS CONNECT ERROR:::', error);
  });

module.exports = { redis };
