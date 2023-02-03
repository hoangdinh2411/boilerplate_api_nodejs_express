const mongoose = require('mongoose');
require('dotenv').config();

function newConnection(uri) {
  const conn = mongoose.createConnection(uri);
  conn.on('connected', function () {
    console.log('MONGODB CONNECT SUCCESSFULLY!!!:::', this.name);
  });

  conn.on('disconnected', function () {
    console.log('MONGODB DISCONNECT :::', this.name);
  });

  conn.on('error', function (error) {
    console.log('MONGODB ERROR:::', JSON.stringify(error));
  });

  process.on('SIGINT', async () => {
    await conn.close();
    process.exit(0);
  });
  return conn;
}
//new multi connect
const baseApiConnect = newConnection(process.env.DB);

module.exports = { baseApiConnect };
