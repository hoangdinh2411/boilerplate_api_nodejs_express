const redis = require('redis');
const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
});

async function connected() {
  try {
    await client.connect();
    await client.ping();
    console.log('REDIS CONNECT SUCCESSFULLY!!!');
  } catch (error) {
    console.log('REDIS CONNECT ERROR:::', error);
  }
}

module.exports = { connect: connected, client };
