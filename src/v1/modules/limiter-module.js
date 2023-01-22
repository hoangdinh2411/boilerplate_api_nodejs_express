const redis = require('redis');
const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
});

const getIpUser = (req) => {
  return '';
};

const incr = (key) => {
  return new Promise((resolve, reject) => {
    client.incr(key, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { incr };
