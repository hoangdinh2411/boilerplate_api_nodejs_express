const Helper = require('~/plugins/helper-plugin');
const UserModel = require('@v1/models/user-model');
const emailModule = require('@v1/modules/email-module');
const ProcessLogModel = require('@v1/models/process-log-model');

class VerifyController {
  static async email(req, res) {
    let user = await UserModel.findOne({ _id: req.payload.id });
    if (!user) return res.status(404).send({ error: 'user-not-found' });

    if (user.emailVerified) return res.status(422).send({ error: 'email-verified' });

    let log = await ProcessLogModel.findOne({
      createdBy: req.payload.id,
      type: 'email-verify',
    }).sort({
      createdAt: -1,
    });

    if (log) {
      let now = Math.round(new Date().getTime() / 1000);
      let difference = now - log.createdTime;
      let minutes = Math.round(difference / 60);
      if (minutes < 2) return res.status(400).send({ error: 'request-time-exist' });
    }
    let email = new emailModule('verification_email', user.language, user.email);
    let path = `${process.env.DOMAIN}/verified/email?code=${Helper.secretSHA256(
      user._id.toString(),
    )}`;

    email.send_email(
      {
        fullName: user.fullName,
        email: user.email,
        pathVerifyEmail: path,
      },
      async () => {
        await ProcessLogModel.create({
          createdBy: req.payload.id,
          type: 'email-verify',
        });
      },
    );
    return res.status(200).send({ message: 'send-email-success' });
  }

  static async verifyEmail(req, res) {
    let codeVerify = Helper.secretSHA256(req.payload.id);
    if (req.query.code !== codeVerify) return res.status(422).send({ error: 'code-not-verify' });

    let user = await UserModel.findOne({ _id: req.payload.id });
    if (!user) return res.status(404).send({ error: 'user-not-found' });

    await UserModel.findOneAndUpdate({
      emailVerified: true,
    });

    return res.status(200).send({ message: 'verified-email-success' });
  }
}

module.exports = VerifyController;
