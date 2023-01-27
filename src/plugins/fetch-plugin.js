const qs = require('qs');
class Fetch {
  static async get({ path, headers, params }) {
    try {
      headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
      return (
        await fetch(`${path}${params ? `?${qs.stringify(params)}` : ''}`, {
          method: 'get',
          headers: headers,
        })
      ).json();
    } catch (error) {
      console.log('get error ', error);
    }
  }

  static async post({ path, headers, data }) {
    try {
      let body = data;
      if (typeof data === 'object') body = JSON.stringify(body);
      headers = Object.assign({ 'content-type': 'application/json' }, headers);
      return (
        await fetch(`${path}`, {
          method: 'post',
          headers: headers,
          body: body,
        })
      ).json();
    } catch (error) {
      console.log('post error ', error);
    }
  }

  static async put({ path, headers, data }) {
    try {
      headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
      return (
        await fetch(`${path}`, {
          method: 'put',
          headers: headers,
          body: JSON.stringify(data),
        })
      ).json();
    } catch (error) {
      console.log('put error ', error);
    }
  }

  static async patch({ path, headers, data }) {
    try {
      headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
      return (
        await fetch(`${path}`, {
          method: 'patch',
          headers: headers,
          body: JSON.stringify(data),
        })
      ).json();
    } catch (error) {
      console.log('patch error ', error);
    }
  }
}

module.exports = Fetch;
