const sanitize = require('mongo-sanitize');
const createError = require('http-errors');
// const appleSigninAuth = require('apple-signin-auth');
const UserModel = require('@v1/models/user-model');
const SettingModel = require('@v1/models/setting-model');
const LanguageModel = require('@v1/models/language-model');
const firebaseModule = require('@v1/modules/firebase-module');
const EmailModule = require('@v1/modules/email-module');
const helperModule = require('~/api/v1/helpers/auth');
const { register, login } = require('@v1/validations/auth-validate');

class AuthController {
  static async register(req, res, next) {
    try {
      let userExits = await UserModel.findOne({
        email: req.body.email,
      });
      if (userExits) return res.status(422).send({ error: 'email-exits' });

      await register.validateAsync(req.body);
      // let language = await LanguageModel.findOne({ locale: 'vi' });
      // req.body.language = language._id;

      let user = new UserModel(req.body);
      user.setPassword(req.body.password);

      return user
        .save()
        .then(async (data) => {
          let token = await helperModule.generateToken({
            payload: { id: data._id, email: data.email },
            remember: req.body.remember,
            type: 'token',
          });

          let refreshToken = await helperModule.generateToken({
            payload: {
              id: data._id,
              email: data.email,
            },
            remember: false,
            type: 'refresh',
          });

          return res
            .status(200)
            .send({ fullName: data.fullName, email: data.email, token, refreshToken });
        })
        .catch((error) => {
          console.error(error);
          return next(createError.BadRequest(error.message));
        });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async login(req, res, next) {
    try {
      await login.validateAsync(req.body);
      let user = await UserModel.findOne({
        email: sanitize(req.body.email),
      });

      if (!user || user.status === 'close')
        return res.status(404).send({ error: 'user-not-found' });
      if (!user.validatePassword(req.body.password))
        return res.status(422).send({
          error: 'user-incorrect-password',
        });

      let token = await helperModule.generateToken({
        payload: { id: user._id, email: user.email },
        remember: req.body.remember,
        type: 'token',
      });

      let refreshToken = await helperModule.generateToken({
        payload: {
          id: user._id,
          email: user.email,
        },
        remember: false,
        type: 'refresh',
      });
      let data = user.jsonData();

      data.token = token;
      data.refreshToken = refreshToken;

      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  // static async loginFacebook(req, res, next) {
  //   let { accessToken } = req.body;
  //   if (!accessToken)
  //     return res.status(422).send({
  //       error: 'access-token-is-require',
  //     });
  //   try {
  //     let setting = await SettingModel.findOne({});
  //     let dataFacebook = await Fetch.get({
  //       path: `https://graph.facebook.com/me?fields=email,name,picture&accessToken=${accessToken}`,
  //     });
  //     if (!dataFacebook.id)
  //       return res.status(422).send({
  //         error: 'facebook-login-failed',
  //       });
  //     let user = await UserModel.findOne({
  //       $or: [{ email: dataFacebook.email }, { uid: dataFacebook.id, typeLogin: 'facebook' }],
  //     });
  //     let firstLogin = !user;
  //     if (!user) {
  //       let userData = {
  //         email: dataFacebook.email || `${dataFacebook.id}@gmail.com`,
  //         password: dataFacebook.id,
  //         fullName: dataFacebook.name,
  //         avatar: `https://graph.facebook.com/${dataFacebook.id}/picture?type=large&redirect=true&width=300&height=300`,
  //         typeLogin: 'facebook',
  //         uid: dataFacebook.id,
  //       };

  //       let language = await LanguageModel.findOne({ locale: 'vi' });
  //       userData.language = language._id;
  //       let newUser = new UserModel(userData);
  //       newUser.setPassword(userData.password);
  //       user = await newUser.save();
  //     } else {
  //       let dataUpdate = {};
  //       !user.uid && (dataUpdate.uid = dataFacebook.user);
  //       user.typeLogin !== 'facebook' && (dataUpdate.typeLogin = 'facebook');
  //       if (Object.keys(dataUpdate).length > 0)
  //         await UserModel.findOneAndUpdate(
  //           {
  //             _id: user._id,
  //           },
  //           dataUpdate,
  //         );
  //     }
  // let token = await Helper.generateToken({
  //   id: user._id,
  //   email: user.email,
  //   uid: user.uid,
  // }, true,
  //   'token');
  //     let data = user.jsonData();
  //     data.token = token;
  //     data.firstLogin = firstLogin;
  //     data.needOtp = setting.needOtp;
  //     return res.status(200).send(data);
  //   } catch (error) {
  //     console.error(error);
  //     return next(createError.BadRequest(error.message));;
  //   }
  // }

  // static async loginApple(req, res, next) {
  //   let { dataLogin } = req.body;
  //   if (!dataLogin)
  //     return res.status(422).send({
  //       error: 'data-login-is-require',
  //     });
  //   try {
  //     let setting = await SettingModel.findOne({});
  //     let dataApple = await appleSigninAuth.verifyIdToken(dataLogin.identityToken, {
  //       nonce: dataLogin.nonce
  //         ? crypto.createHash('sha256').update(dataLogin.nonce).digest('hex')
  //         : undefined,
  //     });
  //     if (!dataApple.sub)
  //       return res.status(422).send({
  //         error: 'apple-login-failed',
  //       });

  //     let user = await UserModel.findOne({
  //       $or: [{ email: dataApple.email }, { uid: dataApple.sub, typeLogin: 'apple' }],
  //     });
  //     let firstLogin = !user;
  //     if (!user) {
  //       let userData = {
  //         email: dataApple.email,
  //         password: dataApple.sub,
  //         fullName: dataLogin.fullName.familyName || dataApple.sub.slice(0, 10),
  //         typeLogin: 'apple',
  //         uid: dataApple.sub,
  //         emailVerified: true,
  //       };

  //       let language = await LanguageModel.findOne({ locale: 'vi' });
  //       userData.language = language._id;
  //       let newUser = new UserModel(userData);
  //       newUser.setPassword(userData.password);
  //       user = await newUser.save();

  //     } else {
  //       let dataUpdate = {};
  //       !user.emailVerified && (dataUpdate.emailVerified = true);
  //       !user.uid && (dataUpdate.uid = dataApple.sub);
  //       user.typeLogin !== 'apple' && (dataUpdate.typeLogin = 'apple');
  //       if (Object.keys(dataUpdate).length > 0)
  //         await UserModel.findOneAndUpdate(
  //           {
  //             _id: user._id,
  //           },
  //           dataUpdate,
  //         );
  //     }
  //     let token = await Helper.generateToken({
  //       id: user._id,
  //       email: user.email,
  //       uid: user.uid,
  //     },  true,
  // 'token',);
  //     let data = user.jsonData();
  //     data.token = token;
  //     data.firstLogin = firstLogin;
  //     data.needOtp = setting.needOtp;
  //     return res.status(200).send(data);
  //   } catch (error) {
  //     console.error(error);
  //     return next(createError.BadRequest(error.message));;
  //   }
  // }

  // static async loginGoogle(req, res, next) {
  //   let { accessToken } = req.body;
  //   if (!accessToken)
  //     return res.status(422).send({
  //       error: 'access-token-is-require',
  //     });
  //   try {
  //     let dataGoogle = await Fetch.get({
  //       path: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`,
  //       credentials: 'include',
  //     });
  //     if (!dataGoogle.sub)
  //       return res.status(422).send({
  //         error: 'google-login-failed',
  //       });
  //     let setting = await SettingModel.findOne({});
  //     let user = await UserModel.findOne({
  //       $or: [{ email: dataGoogle.email }, { uid: dataGoogle.sub, typeLogin: 'google' }],
  //     });
  //     let firstLogin = !user;
  //     if (!user) {
  //       let userData = {
  //         email: dataGoogle.email,
  //         password: dataGoogle.sub,
  //         avatar: dataGoogle.picture
  //           ? `${dataGoogle.picture.split('=').slice(0, -1).join('')}=s300`
  //           : '',
  //         fullName: dataGoogle.name || dataGoogle.sub.slice(0, 10),
  //         typeLogin: 'google',
  //         uid: dataGoogle.sub,
  //         emailVerified: true,
  //       };
  //       let language = await LanguageModel.findOne({ locale: 'vi' });
  //       userData.language = language._id;
  //       let newUser = new UserModel(userData);
  //       newUser.setPassword(userData.password);
  //       user = await newUser.save();

  //     } else {
  //       let dataUpdate = {};
  //       !user.emailVerified && (dataUpdate.emailVerified = true);
  //       !user.uid && (dataUpdate.uid = dataGoogle.sub);
  //       user.typeLogin !== 'google' && (dataUpdate.typeLogin = 'google');
  //       if (Object.keys(dataUpdate).length > 0)
  //         await UserModel.findOneAndUpdate(
  //           {
  //             _id: user._id,
  //           },
  //           dataUpdate,
  //         );
  //     }
  //     let token = await helperModule.generateToken({
  //       id: user._id,
  //       email: user.email,
  //       uid: user.uid,
  //     }, true, 'token');
  //     let data = user.jsonData();
  //     data.token = token;
  //     data.firstLogin = firstLogin;
  //     data.needOtp = setting.needOtp;
  //     return res.status(200).send(data);
  //   } catch (error) {
  //     console.error(error);
  //     return next(createError.BadRequest(error.message));;
  //   }
  // }

  static async token(req, res, next) {
    try {
      let { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      if (refreshToken) {
        let { payload, err } = helperModule.validateToken({ token: refreshToken, type: 'refresh' });
        if (err) return next(createError.Unauthorized(err.message));
        let { email, id } = payload;
        let token = await helperModule.generateToken({
          payload: { email, id },
          remember: false,
          type: 'token',
        });

        return res.status(200).json({ token });
      }
      return res.status(404).send({ error: 'Invalid request' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async phone(req, res, next) {
    try {
      let { uid, phone } = req.body;
      let user = await firebaseModule.getUserPhone({ uid, phone });
      if (!user) return res.status(404).send({ error: 'user-phone-not-found' });

      return res.status(200).send({ message: 'user-phone-verified' });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = AuthController;
