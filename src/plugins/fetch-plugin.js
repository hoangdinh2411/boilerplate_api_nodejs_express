const fetch = require('node-fetch');
const qs = require('qs');

class Fetch {
  static get({ path, headers, params }) {
    headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
    return fetch(`${path}${params ? `?${qs.stringify(params)}` : ''}`, {
      method: 'get',
      headers: headers,
    })
      .then((res) => res.json())
      .catch((error) => {
        console.log('get error ', error);
      });
  }

  static post({ path, headers, data }) {
    let body = data;
    if (typeof data === 'object') body = JSON.stringify(body);
    headers = Object.assign({ 'content-type': 'application/json' }, headers);
    return fetch(`${path}`, {
      method: 'post',
      headers: headers,
      body: body,
    })
      .then((res) => res.json())
      .catch((error) => {
        console.log('post error ', error);
      });
  }

  static put({ path, headers, data }) {
    headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
    return fetch(`${path}`, {
      method: 'put',
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((error) => {
        console.log('put error ', error);
      });
  }
  static patch({ path, headers, data }) {
    headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
    return fetch(`${path}`, {
      method: 'patch',
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((error) => {
        console.log('patch error ', error);
      });
  }
}

module.exports = Fetch;
