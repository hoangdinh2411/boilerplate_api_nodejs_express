const otpGenerator = require('otp-generator');
const OtpModel = require('@v1/models/otp-model');

class OtpModule {
  static async generatorForgotPassword({ email, phone, type }) {
    let options = {
      type,
    };
    email && (options.email = email);
    phone && (options.phone = phone);

    let exist = await OtpModel.findOne(options);
    if (exist)
      return {
        status: 'exist',
        otp: exist,
      };

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    options.code = otp;
    let newOtp = await OtpModel.create(options);
    return {
      status: 'new',
      otp: newOtp,
    };
  }
  static async verify({ code, type, email, phone }) {
    let options = {
      type,
    };
    email && (options.email = email);
    phone && (options.phone = phone);

    let exist = await OtpModel.findOne(options);
    if (exist) {
      await OtpModel.deleteOne(options);
      return bcrypt.compareSync(code, exist.code);
    }
    return false;
  }
}

module.exports = OtpModule;
