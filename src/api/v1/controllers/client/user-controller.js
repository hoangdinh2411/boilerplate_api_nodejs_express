const createError = require('http-errors');
const UserModel = require('@v1/models/user-model');
const otpModule = require('@v1/modules/otp-module');

class UserController {
  static async forgotPassword(req, res) {
    let { email } = req.body;

    let user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user) return res.status(404).send({ error: 'user-not-found-by-email' });

    let generator = await otpModule.generatorForgotPassword(user);
    if (generator.status === 'new') {
      let emailSend = new emailModule('forgot-password', 'vi', email);

      await emailSend.send_email({
        fullName: user.fullName,
        email: user.email,
        codeForgotPassword: generator.otp.code,
      });
    }

    return res.status(200).send({ message: 'forgot-password-success' });
  }

  static async resetPassword(req, res) {
    let { password, code, email } = req.body;

    let user = await UserModel.findOne({
      email,
    });
    if (!user) return res.status(404).send({ error: 'user-not-found-by-email' });

    let status = await otpModule.verify(code, 'forgot-password', user._id, 'User');
    if (!status) return res.status(422).send({ error: 'code-not-verify' });

    user.updatePassword = password;
    try {
      await user.save();
      return res.status(200).send({ message: 'reset-password-success' });
    } catch (error) {
      return next(createError.BadRequest(error.message));
    }
  }

  static async list(req, res) {
    let { limit, page, keyword } = req.query;
    if (!limit) limit = 20;
    if (!page) page = 1;

    let skip = limit * page - limit;
    let options = {};
    if (keyword) options.fullName = new RegExp(keyword, 'img');
    try {
      let list = await UserModel.find(options).skip(skip).limit(limit).sort({ createdAt: -1 });
      let count = await UserModel.countDocuments(options);

      return res.status(200).send({ count, list });
    } catch (error) {
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = UserController;
