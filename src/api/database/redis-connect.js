const Redis = require('ioredis');
// const redis = new Redis({
//   port: 17379, // Redis port
//   host: 'redis-17379.c295.ap-southeast-1-1.ec2.cloud.redislabs.com:17379', // Redis host
//   username: 'default', // needs Redis >= 6
//   password: 'zHnorcUAhHANQpk5jcRG952xX2h6xpgC',
//   // db: 0, // Defaults to 0
// });

const redis = new Redis();

redis
  .ping()
  .then(function () {
    console.log('REDIS CONNECT SUCCESSFULLY!!!');
  })
  .catch(function (error) {
    console.log('REDIS CONNECT ERROR:::', error);
  });

module.exports = { redis };
