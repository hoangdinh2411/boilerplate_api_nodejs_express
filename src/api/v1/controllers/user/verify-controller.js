const createError = require('http-errors');
const EmailModule = require('@v1/modules/email-module');
const OtpModule = require('@v1/modules/otp-module');
const UserModel = require('@v1/models/user-model');
const ProcessLogModel = require('@v1/models/process-log-model');

class VerifyController {
  static async email(req, res, next) {
    try {
      let { email: emailUser } = req.query;

      if (emailUser) {
        let exist = await UserModel.findOne({ email: emailUser.trim().toLowerCase() });
        if (exist) return next(createError.Conflict('email-registered'));
      }

      let user = await UserModel.findOne({ _id: req.payload.id });
      if (user.emailVerified) return next(createError.UnprocessableEntity('email-verified'));

      let generator = await OtpModule.generatorForgotPassword({
        email: emailUser.trim().toLowerCase(),
        type: 'email-verify',
      });
      if (generator.status === 'new') {
        let email = new EmailModule(
          'verification_email',
          user.language.locale,
          user.email || emailUser,
        );

        await email.sendEmail(
          {
            fullName: user.fullName,
            email: user.email || emailUser,
            codeOtp: generator.otp.code,
          },
          async () => {
            await ProcessLogModel.create({
              createdBy: req.payload.id,
              type: 'email-verify',
            });
          },
        );
      }
      return res.status(201).json({ message: 'send-email-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      let { code, isRegister = false } = req.body;
      let user = await UserModel.findOne({ _id: req.payload.id });
      let status = await OtpModule.verify({ code, type: 'email-verify', email: user.email });
      if (!status) return next(createError.UnprocessableEntity('code-not-verify'));

      await UserModel.findOneAndUpdate(
        { _id: req.payload.id },
        {
          emailVerified: true,
        },
      );

      if (isRegister) {
        let email = new EmailModule('register_account', 'vi', user.email);
        await email.sendEmail({
          fullName: user.fullName,
          email: user.email,
        });
      }

      return res.status(201).json({ message: 'verified-email-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = VerifyController;
