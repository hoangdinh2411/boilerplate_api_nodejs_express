const createError = require('http-errors');
const NotificationModel = require('@v1/models/notification-model');
const NotificationPermissionModel = require('@v1/models/notification-permission-model');
const NotificationStatusModel = require('@v1/models/notification-status-model');
const UserModel = require('@v1/models/user-model');

class NotificationController {
  static async notifications(req, res) {
    try {
      let { limit = 20, page = 1, type } = req.query;
      let skip = page * limit - limit;
      let user = await UserModel.findOne({
        _id: req.payload.id,
      }).populate('language');

      let isEnglish = user.language.locale === 'en';
      let filters = {
        $or: [{ readBy: user._id }, { readBy: 'all' }],
        createdAt: { $gte: user.createdAt },
      };
      if (type) filters.type = type;
      let permissions = await NotificationPermissionModel.find(filters)
        .skip(skip)
        .limit(limit)
        .populate('notificationId')
        .sort({ createdAt: -1 });

      let data = await Promise.all(
        structuredClone(permissions).map(async (l) => {
          let status = await NotificationStatusModel.findOne({
            notificationId: l.notificationId._id,
            userId: user._id,
          });
          l.read = !!status;
          if (user.language)
            isEnglish && (l.notificationId.contents = l.notificationId.contents.reverse());
          return l;
        }),
      );

      let count = await NotificationPermissionModel.countDocuments(filters).exec();
      let filterRead = {
        userId: user._id,
      };
      if (type) filterRead.type = type;
      let countRead = await NotificationStatusModel.countDocuments(filterRead).exec();
      return res.status(200).json({ list: data, count, countRead });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async countNotRead(req, res) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });

      let countNotRead = await NotificationPermissionModel.countDocuments({
        $or: [{ readBy: user._id }, { readBy: 'all' }],
        createdAt: { $gte: user.createdAt },
      }).exec();

      let countRead = await NotificationStatusModel.countDocuments({
        userId: user._id,
      }).exec();

      let count = countNotRead - countRead;
      return res.status(200).json({ count });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async notificationRead(req, res) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });

      let notification = await NotificationModel.findOne({
        _id: req.params.id,
      });
      if (!notification) return next(createError.NotFound('notification-not-found'));

      let permission = await NotificationPermissionModel.findOne({
        notificationId: notification._id,
        $or: [{ readBy: user._id }, { readBy: 'all' }],
        createdAt: { $gte: user.createdAt },
      });

      if (!permission) return next(createError.NotFound('notification-permission-not-found'));

      let status = await NotificationStatusModel.findOne({
        notificationId: notification._id,
        userId: user._id,
      });
      if (!status)
        await NotificationStatusModel.create({
          notificationId: notification._id,
          userId: user._id,
          type: notification.type,
        });

      return res.status(201).json({
        message: 'read-notification-success',
      });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async notificationReadAll(req, res) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });

      let limit = 100;
      let page = 1;
      let length = 0;
      do {
        let skip = page * limit - limit;
        let permission = await NotificationPermissionModel.find({
          readBy: user._id,
          createdAt: { $gte: user.createdAt },
        })
          .limit(limit)
          .populate('notificationId')
          .skip(skip);

        await Promise.all(
          permission.map(async (p) => {
            let status = await NotificationStatusModel.findOne({
              notificationId: p.notificationId._id,
              userId: user._id,
            });
            if (!status)
              await NotificationStatusModel.create({
                notificationId: p.notificationId._id,
                userId: user._id,
                type: p.notificationId.type,
              });
            return p;
          }),
        );
        page++;
        length = permission.length;
      } while (length === limit);

      return res.status(201).json({ message: 'read-all-success' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
  static async notification(req, res) {
    try {
      let user = await UserModel.findOne({
        _id: req.payload.id,
      });

      let notification = await NotificationModel.findOne({
        _id: req.params.id,
      });

      if (!notification) return next(createError.NotFound('notification-not-found'));

      let permission = await NotificationPermissionModel.findOne({
        notificationId: notification._id,
        $or: [{ readBy: user._id }, { readBy: 'all' }],
      });

      if (!permission) return next(createError.NotFound('notification-permission-not-found'));

      let status = await NotificationStatusModel.findOne({
        notificationId: notification._id,
        userId: user._id,
      });

      return res.status(200).json({ notification, status: !!status });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = NotificationController;
