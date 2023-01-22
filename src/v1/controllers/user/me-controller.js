const { client } = require('~/config/db/redis-connect');
const UserModel = require('@v1/models/user-model');
const UserDeviceModel = require('@v1/models/user-device-model');
const LanguageModel = require('@v1/models/language-model');
const notificationModule = require('@v1/modules/notification-module');
const userValidate = require('@v1/validations/user-validate');

class MeController {
  static async get(req, res) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      }).select('-password');
      if (!user) return res.status(401).send({ error: 'user-not-found' });

      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async update(req, res) {
    let { avatar, coverImage, fullName, gender, birthday, address, company, introduce, phone } =
      req.body;
    let data = {
      avatar,
      coverImage,
      fullName,
      gender,
      birthday,
      address,
      company,
      introduce,
      phone,
    };

    try {
      avatar && new URL(avatar);
      coverImage && new URL(coverImage);
      await userValidate.userSave.validateAsync(data);
      let user;
      user = await UserModel.findOne({
        _id: req.payload.id,
      });
      if (!user) return res.status(404).send({ error: 'user-not-found' });

      user = await UserModel.findOneAndUpdate({ _id: req.payload.id }, data, {
        new: true,
      }).select(['-hash', '-salt']);
      let hasVerify = !!(user.phone && user.avatar && user.introduce && user.language);

      if (user.verify !== hasVerify)
        user = await UserModel.findOneAndUpdate(
          {
            _id: user._id,
          },
          {
            verify: hasVerify,
          },
          {
            new: true,
          },
        ).select(['-hash', '-salt']);
      return res.status(200).send(user);
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }

  static async updateLanguage(req, res) {
    let { language } = req.body;
    if (!language) return res.status(422).send({ error: 'language-is-require' });
    try {
      let user;
      user = await UserModel.findOne({
        _id: req.payload.id,
      });
      if (!user) return res.status(404).send({ error: 'user-not-found' });
      let languageUser = await LanguageModel.findOne({ locale: language });
      if (!languageUser) return res.status(404).send({ error: 'language-not-found' });
      user = await UserModel.findOneAndUpdate(
        { _id: user._id },
        { language: languageUser._id },
        {
          new: true,
        },
      ).select(['-hash', '-salt']);
      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async registerDevice(req, res) {
    let { deviceToken } = req.body;
    let data = {
      deviceToken,
      userId: req.payload.id,
    };

    try {
      await userValidate.deviceSave.validateAsync(data);
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });
      await UserDeviceModel.deleteMany({ deviceToken });
      let create = await UserDeviceModel.create(data);

      if (user.notification) {
        await notificationModule.registerTopicAll(create);
        await notificationModule.registerDeviceUserOld(create);
      }
      return res.status(200).send(create);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async statusNotification(req, res) {
    try {
      await userValidate.statusNotification.validateAsync(req.body);
      let user = await UserModel.findOneAndUpdate(
        {
          _id: req.payload.id,
        },
        { notification: req.body.status },
        {
          new: true,
        },
      );

      if (user.notification) await notificationModule.userRegister(user);
      else await notificationModule.userCancelRegister(user);

      return res.status(200).send({ message: 'notification-update-status-success' });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async deleteDevice(req, res) {
    let { deviceToken } = req.body;
    try {
      let device = await UserDeviceModel.findOne({
        deviceToken,
        userId: req.payload.id,
      });
      if (device) await notificationModule.cancelTopic(device);
      await UserDeviceModel.findOneAndDelete({
        deviceToken,
        userId: req.payload.id,
      });

      return res.send({ message: 'delete-device-success' });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async updatePassword(req, res) {
    let { oldPassword, newPassword } = req.body;
    oldPassword = oldPassword.trim();
    newPassword = newPassword.trim();
    if (oldPassword === newPassword)
      return res.status(422).send({
        error: 'new-password-must-not-old-password',
      });

    let user = await UserModel.findOne({ _id: req.payload.id });
    if (!user) return res.status(404).send({ error: 'user-not-found' });

    if (!user.validatePassword(oldPassword))
      return res.status(422).send({
        error: 'old-password-is-incorrect',
      });

    user.updatePassword = newPassword;
    try {
      await user.save();
      return res.status(200).send({ message: 'update-password-success' });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async logout(req, res) {
    let { deviceToken } = req.body;
    try {
      if (deviceToken) {
        let device = await UserDeviceModel.findOne({
          deviceToken,
          userId: req.payload.id,
        });
        if (device) await notificationModule.cancelTopic(device);
        await UserDeviceModel.findOneAndDelete({
          deviceToken,
          userId: req.payload.id,
        });
      }
      await client.del(req.payload.id.toString());
      return res.status(200).send({ message: 'user-logout-success' });
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }
}

module.exports = MeController;
