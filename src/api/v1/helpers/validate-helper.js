const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  validateEmail: function (email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  validateProfileUrl: function (url) {
    const re = /^(\w)+$/;
    return re.test(String(url).toLowerCase());
  },
  validatePhoneNumber: function (phone) {
    const re = /^[0-9+]{9,12}$/;
    return re.test(phone);
  },
  isValidObjectId: function (id) {
    if (ObjectId.isValid(id)) {
      return new ObjectId(id).toString() === id;
    }
    return false;
  },
};
