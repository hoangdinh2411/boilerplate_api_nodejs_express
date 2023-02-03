const firebaseAdmin = require('firebase-admin');
const NotificationTopicModel = require('@v1/models/notification-topic-model');
const NotificationTopicDeviceModel = require('@v1/models/notification-topic-device-model');
const UserModel = require('@v1/models/user-model');
const UserDeviceModel = require('@v1/models/user-device-model');
const NotificationTopicUserModel = require('@v1/models/notification-topic-user-model');
const NotificationPermissionModel = require('@v1/models/notification-permission-model');
const serviceAccount = require('~/config/admin.json');

class NotificationModule {
  constructor() {
    if (firebaseAdmin.apps.length === 0)
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    this.fcm = firebaseAdmin.messaging();
  }

  async sendMessageCondition(condition, notification, action, image) {
    let setting = {
      condition,
      notification,
      data: structuredClone(action),
    };

    // if (image)
    setting = {
      ...setting,
      android: {
        notification: {
          // imageUrl: image,
          sound: 'default',
          default_sound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            default_sound: true,
          },
        },
        // fcm_options: {
        //   image,
        // },
      },
      webpush: {
        // headers: {
        //   image,
        // },
      },
    };

    this.fcm
      .send(setting)
      .then((res) => {
        console.log('sendMessageCondition success : ');
      })
      .catch((error) => {
        console.log('sendMessageCondition error : ', error);
      });
  }

  async sendMessageMulticast(tokens, notification, action, image) {
    let setting = {
      tokens,
      notification,
      data: structuredClone(action),
    };

    // if (image)
    setting = {
      ...setting,
      android: {
        notification: {
          // imageUrl: image,
          sound: 'default',
          default_sound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            default_sound: true,
          },
        },
        // fcm_options: {
        //   image,
        // },
      },
      webpush: {
        // headers: {
        //   image,
        // },
      },
    };

    tokens.length &&
      this.fcm
        .sendMulticast(setting)
        .then((res) => {
          console.log('sendMessageMulticast success : ');
        })
        .catch((error) => {
          console.log('sendMessageMulticast error : ', error);
        });
  }

  async sendMessageTopic({ name, notification, action, image }) {
    let setting = {
      topic: name,
      notification,
      data: action,
    };

    // if (image)
    setting = {
      ...setting,
      android: {
        notification: {
          // imageUrl: image,
          sound: 'default',
          default_sound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            default_sound: true,
          },
        },
        // fcm_options: {
        //   image,
        // },
      },
      webpush: {
        // headers: {
        //   image,
        // },
      },
    };

    this.fcm
      .send(setting)
      .then((res) => {
        console.log('sendMessage success : ');
      })
      .catch((error) => {
        console.log('sendMessage error : ', error);
      });
  }

  async sendMessageAll(notification, action, image = null) {
    let topicAll = await NotificationTopicModel.findOne({
      name: 'all_device',
      status: 2,
      type: 1,
    });

    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let topics = await NotificationTopicModel.find({
        $or: [{ _id: topicAll._id }, { mapId: topicAll._id }],
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        topics.map(async (t) => {
          await this.sendMessageTopic({
            name: t.name,
            notification,
            action,
            image,
          });
        }),
      );

      page++;
      length = topics.length;
    } while (length === limit);
  }

  // Đăng ký 1 thiết bị với topic by name
  async registerTopicByName(userDevice, name) {
    let topicByName = await this.saveTopicByName(name);
    await this.registerTopic(userDevice, topicByName);
  }

  // user tăt thông báoz
  async userCancelRegister(user) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let userDevices = await UserDeviceModel.find({
        userId: user._id,
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        userDevices.map(async (device) => {
          let length1 = 0,
            page1 = 1,
            limit1 = 100;
          do {
            let skip1 = page1 * limit1 - limit1;
            let devices = await NotificationTopicDeviceModel.find({
              userDeviceId: device._id,
            })
              .populate('notificationTopicId')
              .limit(limit1)
              .skip(skip1)
              .sort({
                createdBy: 1,
              });

            await Promise.all(
              devices.map(async (t) => {
                if (t.notificationTopicId)
                  await this.unsubscribeTopic(t.notificationTopicId, device);
              }),
            );
            page1++;
            length1 = devices.length;
          } while (length1 === limit1);
          return device;
        }),
      );

      page++;
      length = userDevices.length;
    } while (length === limit);
  }

  // Seller bật thông báo
  async userRegister(user) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let devices = await UserDeviceModel.find({
        userId: user._id,
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        devices.map(async (device) => {
          // đăng ký với topic all.
          await this.registerTopicByName(device, 'all_device');

          // Tìm kiếm các topic seller được đăng ký.
          await this.registerDeviceUserOld(device);
          return device;
        }),
      );

      page++;
      length = devices.length;
    } while (length === limit);
  }

  // Seller add thiết bị vào topic đã đăng ký
  async registerDeviceUserOld(userDevice) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let topicSellers = await NotificationTopicUserModel.find({
        userId: UserDeviceModel.userId,
      })
        .limit(limit)
        .skip(skip)
        .populate('notificationTopicId')
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        topicSellers.map(async (__t) => {
          if (__t.notificationTopicId)
            await this.registerTopic(userDevice, __t.notificationTopicId);
          return __t;
        }),
      );

      page++;
      length = topicSellers.length;
    } while (length === limit);
  }

  // Tạo topic map
  async createTopicMap(topic) {
    let count = await NotificationTopicModel.countDocuments({
      $or: [
        {
          _id: topic._id,
        },
        {
          mapId: topic._id,
        },
      ],
    });
    let date = new Date();
    let create = await NotificationTopicModel.create({
      name: `${topic.name}_${count}_${date.getTime()}`,
      type: 2,
      status: 2,
      mapId: topic._id,
    });

    return create;
  }

  // Đăng ký 1 thiết bị với 1 topic
  async registerTopic(userDevice, topic) {
    let length = 0,
      page = 1,
      limit = 100,
      sub,
      register = false;
    do {
      let skip = page * limit - limit;
      let topics = await NotificationTopicModel.find({
        $or: [
          {
            _id: topic._id,
          },
          {
            mapId: topic._id,
          },
        ],
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      let breakFor = false;

      for (let i = 0; i < topics.length; i++) {
        let __t = topics[i];
        let topicRegister = await NotificationTopicDeviceModel.findOne({
          userDeviceId: UserDeviceModel._id,
          notificationTopicId: __t._id,
        });

        if (topicRegister) {
          breakFor = true;
          register = true;
          break;
        }

        let countDevice = await NotificationTopicDeviceModel.countDocuments({
          notificationTopicId: __t._id,
        });

        if (countDevice < 999) {
          sub = __t;
          breakFor = true;
          break;
        }
      }
      page++;
      if (breakFor) length = 0;
      else length = topics.length;
    } while (length === limit);

    if (!register) {
      if (!sub) sub = await this.createTopicMap(topic);
      await this.subscribeToTopic(sub, userDevice);
    }
  }

  // Hủy thiết bị với các topic
  async cancelTopic(userDevice) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let devices = await NotificationTopicDeviceModel.find({
        userDeviceId: UserDeviceModel._id,
      })
        .limit(limit)
        .skip(skip)
        .populate('notificationTopicId')
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        devices.map(async (__t) => {
          if (__t.notificationTopicId)
            await this.unsubscribeTopic(__t.notificationTopicId, userDevice);
          return __t;
        }),
      );

      page++;
      length = devices.length;
    } while (length === limit);
  }

  // Nhận thông báo 1 thiết bị với 1 topic
  async subscribeToTopic(topic, device) {
    let topicDevice = await NotificationTopicDeviceModel.findOne({
      userDeviceId: device._id,
      notificationTopicId: topic._id,
    });

    if (topicDevice) return;
    this.fcm
      .subscribeToTopic(device.deviceToken, topic.name)
      .then(async (res) => {
        await NotificationTopicDeviceModel.create({
          notificationTopicId: topic._id,
          userDeviceId: device._id,
          userId: device.userId,
        });

        console.log('subscribe topic success : ');
      })
      .catch((error) => {
        console.log('subscribe topic error : ');
      });
  }

  // Hủy thông báo 1 thiết bị với 1 topic
  async unsubscribeTopic(topic, device) {
    this.fcm
      .unsubscribeFromTopic(device.deviceToken, topic.name)
      .then(async (res) => {
        await NotificationTopicDeviceModel.findOneAndDelete({
          notificationTopicId: topic._id,
          userDeviceId: device._id,
        });
        console.log('unsubscribe topic success : ');
      })
      .catch((error) => {
        console.log('unsubscribe topic error : ');
      });
  }

  async createPermission(id, readBy, type) {
    let notify = await NotificationPermissionModel.findOne({
      notificationId: id,
      readBy,
    });

    if (!notify) {
      await NotificationPermissionModel.create({
        notificationId: id,
        readBy,
        type,
      });
    }
    return true;
  }

  async createPermissionAndPush(record) {
    let { _id, type, typeSend, action, params, contents } = record;

    let content = contents.find((c) => c.language === 'vi');

    if (action && Object.keys(action).length === 0)
      action = {
        id: _id.toString(),
        type,
      };
    try {
      switch (typeSend) {
        case 'all':
          await this.createPermission(_id, 'all', type);
          await this.sendMessageAll(
            {
              title: content.title,
              body: content.subTitle,
            },
            action,
            content.image,
          );
          break;
        case 'topic': // topic
          let topics = [];
          await Promise.all(
            params.map(async (d) => {
              let length = 0,
                page = 1,
                limit = 20;
              do {
                let skip = page * limit - limit;

                let notificationTopics = await NotificationTopicModel.find({
                  $or: [{ _id: d }, { mapId: d }],
                })
                  .limit(limit)
                  .skip(skip)
                  .sort({
                    createdAt: 1,
                  });

                await Promise.all(
                  notificationTopics.map(async (t) => {
                    if (!topics.includes(t.name)) topics.push(t.name);

                    let options = {
                      notificationTopicId: t._id,
                    };
                    if (action.userNotSend) {
                      options.userId = action.userNotSend;
                    }

                    let topicDevices = await NotificationTopicDeviceModel.find(options)
                      .limit(999)
                      .skip(0);
                    for (let i = 0; i < topicDevices.length; i++) {
                      let __device = topicDevices[i];
                      if (__device.userId) await this.createPermission(_id, __device.userId, type);
                    }
                  }),
                );

                page++;
                length = notificationTopics.length;
              } while (length === limit);
            }),
          );

          let condition = topics
            .map((n) => {
              return `'${n}' in topics`;
            })
            .join(' && ');

          await this.sendMessageCondition(
            condition,
            {
              title: content.title,
              body: content.subTitle,
            },
            action,
            content.image,
          );

          break;
        case 'users':
          let devices = [];
          let user = await UserModel.findOne({ _id: params[0] }).populate('language');
          if (user)
            content = contents.find((c) => {
              return c.language === user.language.locale;
            });

          await Promise.all(
            params.map(async (userId) => {
              await this.createPermission(_id, userId, type);

              let length2 = 0,
                page2 = 1,
                limit2 = 20;
              do {
                let skip2 = page2 * limit2 - limit2;

                let listDevice = await UserDeviceModel.find({
                  userId: userId,
                })
                  .limit(limit2)
                  .skip(skip2)
                  .sort({
                    createdAt: 1,
                  });

                for (let j = 0; j < listDevice.length; j++) {
                  let __s = listDevice[j];

                  if (!devices.includes(__s.deviceToken)) devices.push(__s.deviceToken);
                }

                page2++;
                length2 = listDevice.length;
              } while (length2 === limit2);
            }),
          );

          await this.sendMessageMulticast(
            devices,
            {
              title: content.title,
              body: content.subTitle,
            },
            action,
            content.image,
          );
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // User đăng ký tất cả thiết bị với topic
  async userRegisterTopic(user, topic) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let devices = await UserDeviceModel.find({
        userId: user._id,
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        devices.map(async (device) => {
          await this.registerTopic(device, topic);
        }),
      );

      page++;
      length = devices.length;
    } while (length === limit);
  }
  // User hủy tất cả thiết bị với topic
  async userCancelRegisterTopic(user, topic) {
    let length = 0,
      page = 1,
      limit = 100;
    do {
      let skip = page * limit - limit;
      let devices = await UserDeviceModel.find({
        userId: user._id,
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: 1,
        });

      await Promise.all(
        devices.map(async (device) => {
          await this.unsubscribeTopic(topic, device);
        }),
      );

      page++;
      length = devices.length;
    } while (length === limit);
    await NotificationTopicUserModel.deleteOne({
      notificationTopicId: topic._id,
      userId: user._id,
    });
  }

  async saveTopicByName(name) {
    let topicByName = await NotificationTopicModel.findOne({
      name,
      status: 2,
      type: 1,
    });

    if (!topicByName)
      topicByName = await NotificationTopicModel.create({
        name,
        status: 2,
        type: 1,
      });
    return topicByName;
  }

  async saveTopicUser(user, topic) {
    let topicUser = await NotificationTopicUserModel.findOne({
      notificationTopicId: topic._id,
      userId: user._id,
    });

    if (!topicUser)
      topicUser = await NotificationTopicUserModel.create({
        notificationTopicId: topic._id,
        userId: user._id,
      });
  }
}

module.exports = new NotificationModule();
