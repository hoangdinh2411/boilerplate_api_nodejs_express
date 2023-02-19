const requestIp = require('request-ip');
const satelize = require('satelize');
const sha256 = require('sha256');
const randomString = require('randomstring');
const md5 = require('md5');

module.exports = {
  getTimeByTimezone: function (ip) {
    return satelize.satelize({ ip }, (err, payload) => {
      return payload;
    });
  },
  getIpByRequest: function (req) {
    return requestIp.getClientIp(req);
  },
  secretSHA256: function (string) {
    return sha256(process.env.SECRET + string);
  },
  getCurrentTimestamp: function () {
    return Math.round(new Date().getTime() / 1000);
  },
  stringToTime: function (str) {
    return Math.round(Date.parse(str) / 1000);
  },
  getUniqueString: function (data) {
    return md5(data + Math.round(new Date().getTime() / 1000)) + randomString.generate();
  },
  randomCode: function ({ length, type }) {
    let options = {};
    if (length) options.length = length;
    if (type) options.type = type;
    return randomString.generate(options);
  },
  generateFileName: function (originalname) {
    let splitName = originalname.split('.');
    let extension = splitName[splitName.length - 1];
    extension = extension.toLowerCase();
    let hashFile = sha256(originalname);
    let unique = Math.random().toString(36).substring(7) + '_' + Date.now();
    return `${hashFile}_${unique}.${extension}`;
  },
  getFolderNameByMonth: function () {
    let d = new Date();
    return `${d.getMonth() + 1}-${d.getFullYear()}`;
  },
  axios: async function (method, url, headers, data) {
    try {
      let config = {
        method: method,
        url: url,
        headers: headers,
        data: data,
      };
      return (await axios(config)).data;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  getRandomArbitrary: function (min, max) {
    let t = Math.floor(Math.random() * (max - min)) + min;
    return t;
  },
  removeAccent: function (str) {
    str = str.replace(/á|à|ả|ã|ạ|ă|ắ|ặ|ằ|ẳ|ẵ|â|ấ|ầ|ẩ|ẫ|ậ|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ặ|Ằ|Ẳ|Ẵ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ/g, 'a');
    str = str.replace(/đ|Đ/g, 'd');
    str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ/g, 'e');
    str = str.replace(/í|ì|ỉ|ĩ|ị|Í|Ì|Ỉ|Ĩ|Ị/g, 'i');
    str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ/g, 'o');
    str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự/g, 'u');
    str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ|Ý|Ỳ|Ỷ|Ỹ|Ỵ/g, 'y');
    str = str.replace(/\s+/g, '-');
    str = str.replace(/[^\w+]/g, '-');
    str = str.replace(/_+/g, '-');
    return str;
  },
  typeValue: function (value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  },
  objectToQueryString: (obj) =>
    Object.keys(obj)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&'),
  deepFlatten: (arr) => [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v))),
  fromCamelCase: (str, separator = '_') =>
    str
      .replace(/(\[a-z\\d\])(\[A-Z\])/g, '$1' + separator + '$2')
      .replace(/(\[A-Z\]+)(\[A-Z\]\[a-z\\d\]+)/g, '$1' + separator + '$2')
      .toLowerCase(),
  isAbsoluteURL: (str) => /^\[a-z\]\[a-z0-9+.-\]\*:/.test(str),
  getDaysDiffBetweenDates: (dateInitial, dateFinal) =>
    (dateFinal - dateInitial) / (1000 * 3600 * 24),
  uniqueElementsBy: (arr, fn) =>
    arr.reduce((acc, v) => {
      if (!acc.some((x) => fn(v, x))) acc.push(v);
      return acc;
    }, []),
};
