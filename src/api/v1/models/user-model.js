const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const { baseApiConnection } = require('~/config/db/multi-mongo-connect');
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    match:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    // required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: false,
    default: '',
  },
  gender: {
    type: Number,
    required: false,
  },
  verify: {
    type: Boolean,
    required: false,
    default: false,
  },
  avatar: {
    type: String,
    required: false,
    default: '',
  },
  coverImage: {
    type: String,
    required: false,
    default: '',
  },
  birthday: {
    type: String,
    required: false,
    default: '',
  },
  company: {
    type: String,
    required: false,
    default: '',
  },
  introduce: {
    type: String,
    required: false,
    default: '',
  },
  notification: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    required: false,
    default: '',
  },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'language',
  },
  status: {
    type: String,
    required: false,
    default: 'new', //close
  },
});

userSchema.index({ email: 1, phone: 1 }, { unique: true });

userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, 8);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.passwordEncryption = function (password) {
  return bcrypt.hashSync(password, 8);
};

userSchema.methods.jsonData = function () {
  return {
    _id: this._id,
    email: this.email,
    emailVerified: this.emailVerified,
    address: this.address,
    gender: this.gender,
    avatar: this.avatar,
    coverImage: this.coverImage,
    birthday: this.birthday,
    verify: this.verify,
    phone: this.phone,
    status: this.status,
    fullName: this.fullName,
  };
};

userSchema
  .virtual('updatePassword')
  .set(function (rawPass) {
    this._password = rawPass;
    this.password = bcrypt.hashSync(rawPass, 8);
  })
  .get(function () {
    return this._password;
  });

userSchema.pre(/(updateOne|findOneAndUpdate)/, async function (done) {
  done();
});

userSchema.pre('save', async function (done) {
  done();
});

// module.exports = baseApiConnection.model('user', userSchema, 'user');
module.exports = mongoose.model('user', userSchema, 'user');
