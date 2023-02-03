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
        let user_exits = await UserModel.findOne({ email: emailUser.trim().toLowerCase() });
        if (user_exits) return res.status(422).send({ error: 'email-registered' });
      }

      let user = await UserModel.findOne({ _id: req.payload.id });
      if (user.emailVerified) return res.status(422).send({ error: 'email-verified' });

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

        await email.send_email(
          {
            full_name: user.fullName,
            email: user.email || emailUser,
            code_otp: generator.otp.code,
          },
          async () => {
            await ProcessLogModel.create({
              created_by: req.payload.id,
              type: 'email-verify',
            });
          },
        );
      }
      return res.status(200).send({ message: 'send-email-success' });
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
      if (!status) return res.status(422).send({ error: 'code-not-verify' });

      await UserModel.findOneAndUpdate(
        { _id: req.payload.id },
        {
          emailVerified: true,
        },
      );

      if (isRegister) {
        let email = new EmailModule('register_account', 'vi', user.email);
        await email.send_email({
          full_name: user.fullName,
          email: user.email,
        });
      }

      return res.status(200).send({ message: 'verified-email-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = VerifyController;
