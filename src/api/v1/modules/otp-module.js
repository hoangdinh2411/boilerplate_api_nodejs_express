const moment = require('moment');
const otpGenerator = require('otp-generator');
const OtpModel = require('@v1/models/otp-model');
const UserModel = require('@v1/models/user-model');

class OtpModule {
  static async generatorForgotPassword(user) {
    let now = moment().utc();
    let start = moment().add(-10, 'minutes').utc();

    let exist = await OtpModel.findOne({
      targetId: user._id,
      targetName: 'User',
      type: 'forgot-password',
      createdTime: {
        $gte: start.unix(),
        $lte: now.unix(),
      },
    }).sort({
      createdTime: -1,
    });

    if (exist && exist.status === 'new')
      return {
        status: 'exist',
        otp: exist,
      };
    else {
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      let newOtp = await OtpModel.create({
        targetId: user._id,
        targetName: 'User',
        type: 'forgot-password',
        code: otp,
        createdTime: moment().utc().unix(),
      });

      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: { countForgotPassword: 1 },
        },
      );

      return {
        status: 'new',
        otp: newOtp,
      };
    }
  }
  static async verify(code, type, targetId, targetName) {
    let now = moment().utc();
    let start = moment().add(-10, 'minutes').utc();

    let exist = await OtpModel.findOneAndUpdate(
      {
        code: code,
        status: 'new',
        targetId,
        targetName,
        type,
        createdTime: {
          $gte: start.unix(),
          $lte: now.unix(),
        },
      },
      { status: 'used' },
    ).sort({
      createdTime: -1,
    });

    if (exist) return true;
    return false;
  }
}

module.exports = OtpModule;
