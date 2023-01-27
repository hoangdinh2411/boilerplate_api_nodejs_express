const { client } = require('~/config/db/redis-connect');

const get = async (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const set = async (key, count) => {
  return new Promise((resolve, reject) => {
    client.set(key, count, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const incrBy = async (key, count) => {
  return new Promise((resolve, reject) => {
    client.incrby(key, count, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const decrBy = async (key, count) => {
  return new Promise((resolve, reject) => {
    client.decrby(key, count, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const exists = async (key) => {
  return new Promise((resolve, reject) => {
    client.exists(key, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const setNx = async (key, count) => {
  return new Promise((resolve, reject) => {
    client.setnx(key, count, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = {
  get,
  set,
  incrBy,
  exists,
  setNx,
  decrBy,
};
