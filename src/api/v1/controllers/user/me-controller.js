const createError = require('http-errors');
const { redis } = require('~/api/database/redis-connect');
const UserModel = require('@v1/models/user-model');
const UserDeviceModel = require('@v1/models/user-device-model');
const TokenLogModel = require('@v1/models/token-log-model');
const LanguageModel = require('@v1/models/language-model');
const notificationModule = require('@v1/modules/notification-module');
const userValidate = require('@v1/validations/user-validate');

class MeController {
  static async get(req, res, next) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      }).select('-password');

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async update(req, res, next) {
    try {
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

      avatar && new URL(avatar);
      coverImage && new URL(coverImage);
      await userValidate.userSave.validateAsync(data);

      let user = await UserModel.findOneAndUpdate({ _id: req.payload.id }, data, {
        new: true,
      }).select('-password');
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
        ).select('-password');
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async updatePassword(req, res, next) {
    try {
      let { oldPassword, newPassword, logout } = req.body;
      oldPassword = oldPassword.trim();
      newPassword = newPassword.trim();
      if (oldPassword === newPassword)
        return next(createError.UnprocessableEntity('new-password-must-not-old-password'));

      let user = await UserModel.findOne({ _id: req.payload.id });
      if (!user.validatePassword(oldPassword))
        return next(createError.UnprocessableEntity('old-password-is-incorrect'));

      if (logout)
        await TokenLogModel.updateMany({ userId: req.payload.id, status: true }, { status: false });
      await TokenLogModel.create({
        userId: req.payload.id,
        time: Date.now(),
        status: true,
      });

      user.updatePassword = newPassword;

      await user.save();
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async updateLanguage(req, res, next) {
    try {
      let { language } = req.body;
      if (!language) return next(createError.UnprocessableEntity('language-is-require'));

      let languageUser = await LanguageModel.findOne({ locale: language });
      if (!languageUser) return next(createError.NotFound('language-not-found'));
      let user = await UserModel.findOneAndUpdate(
        { _id: req.payload.id },
        { language: languageUser._id },
        {
          new: true,
        },
      ).select('-password');
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async registerDevice(req, res, next) {
    try {
      let { deviceToken } = req.body;
      let data = {
        deviceToken,
        userId: req.payload.id,
      };

      await userValidate.deviceSave.validateAsync(data);
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });
      await UserDeviceModel.deleteMany({ deviceToken });
      let create = await UserDeviceModel.create(data);

      if (user.notification) {
        await notificationModule.registerTopicByName(create, 'all_device');
        await notificationModule.registerDeviceUserOld(create);
      }
      return res.status(201).json(create);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async deleteDevice(req, res, next) {
    try {
      let { deviceToken } = req.body;
      let device = await UserDeviceModel.findOne({
        deviceToken,
        userId: req.payload.id,
      });
      if (device) await notificationModule.cancelTopic(device);
      await UserDeviceModel.findOneAndDelete({
        deviceToken,
        userId: req.payload.id,
      });

      return res.status(204).json({ message: 'delete-device-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async statusNotification(req, res, next) {
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

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async logout(req, res, next) {
    try {
      let { deviceToken } = req.body;
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
      await redis.del(req.payload.id.toString());
      return res.status(204).json({ message: 'user-logout-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = MeController;
