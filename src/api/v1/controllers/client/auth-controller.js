const sanitize = require('mongo-sanitize');
const createError = require('http-errors');
const appleSigninAuth = require('apple-signin-auth');
const UserModel = require('@v1/models/user-model');
const LanguageModel = require('@v1/models/language-model');
const firebaseModule = require('@v1/modules/firebase-module');
const EmailModule = require('@v1/modules/email-module');
const helper = require('@v1/helpers/auth-helper');
const { register, login } = require('@v1/validations/auth-validate');

class AuthController {
  static async token(req, res, next) {
    try {
      let { refreshToken } = req.body;
      if (!refreshToken) return next(createError.UnprocessableEntity('refresh-token-is-require'));
      let { payload, err } = helper.validateToken({ token: refreshToken, type: 'refresh' });
      if (err) return next(createError.Unauthorized(err.message));
      let { email, id } = payload;
      let token = await helper.generateToken({
        payload: { email, id },
        remember: false,
        type: 'token',
      });

      let newRefreshToken = await helper.tokenBlackList({
        payload: { email, id },
        token: refreshToken,
      });

      return res.status(201).json({ token, refreshToken: newRefreshToken });
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async register(req, res, next) {
    try {
      let exist = await UserModel.findOne({
        email: req.body.email,
      });
      if (exist) return next(createError.Conflict('email-exist'));

      await register.validateAsync(req.body);
      // let language = await LanguageModel.findOne({ locale: 'vi' });
      // req.body.language = language._id;

      let user = new UserModel(req.body);
      user.setPassword(req.body.password);

      return user
        .save()
        .then(async (data) => {
          return res.status(201).json({ fullName: data.fullName, email: data.email });
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

      if (!user || user.status === 'close') return next(createError.NotFound('user-not-found'));
      if (!user.validatePassword(req.body.password))
        return next(createError.UnprocessableEntity('user-incorrect-password'));

      let token = await helper.generateToken({
        payload: { id: user._id, email: user.email },
        remember: req.body.remember,
        type: 'token',
      });

      let refreshToken = await helper.generateToken({
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

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async loginFacebook(req, res, next) {
    try {
      let { accessToken } = req.body;
      if (!accessToken) return next(createError.UnprocessableEntity('access-token-is-require'));

      let dataFacebook = await Fetch.get({
        path: `https://graph.facebook.com/me?fields=email,name,picture&accessToken=${accessToken}`,
      });
      if (!dataFacebook.id) return next(createError.UnprocessableEntity('facebook-login-failed'));

      let user = await UserModel.findOne({
        $or: [{ email: dataFacebook.email }, { uid: dataFacebook.id, typeLogin: 'facebook' }],
      });
      let firstLogin = !user;
      if (!user) {
        let userData = {
          email: dataFacebook.email || `${dataFacebook.id}@gmail.com`,
          password: dataFacebook.id,
          fullName: dataFacebook.name,
          avatar: `https://graph.facebook.com/${dataFacebook.id}/picture?type=large&redirect=true&width=300&height=300`,
          typeLogin: 'facebook',
          uid: dataFacebook.id,
        };

        let language = await LanguageModel.findOne({ locale: 'vi' });
        userData.language = language._id;
        let newUser = new UserModel(userData);
        newUser.setPassword(userData.password);
        user = await newUser.save();
      } else {
        let dataUpdate = {};
        !user.uid && (dataUpdate.uid = dataFacebook.user);
        user.typeLogin !== 'facebook' && (dataUpdate.typeLogin = 'facebook');
        if (Object.keys(dataUpdate).length > 0)
          await UserModel.findOneAndUpdate(
            {
              _id: user._id,
            },
            dataUpdate,
          );
      }
      let token = await helper.generateToken({
        payload: { id: user._id, email: user.email, uid: user.uid },
        remember: true,
        type: 'token',
      });

      let refreshToken = await helper.generateToken({
        payload: {
          id: user._id,
          email: user.email,
          uid: user.uid,
        },
        remember: false,
        type: 'refresh',
      });
      let data = user.jsonData();
      data.token = token;
      data.refreshToken = refreshToken;
      data.firstLogin = firstLogin;
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async loginApple(req, res, next) {
    try {
      let { dataLogin } = req.body;
      if (!dataLogin) return next(createError.UnprocessableEntity('data-login-is-require'));

      let dataApple = await appleSigninAuth.verifyIdToken(dataLogin.identityToken, {
        nonce: dataLogin.nonce
          ? crypto.createHash('sha256').update(dataLogin.nonce).digest('hex')
          : undefined,
      });
      if (!dataApple.sub) return next(createError.UnprocessableEntity('apple-login-failed'));

      let user = await UserModel.findOne({
        $or: [{ email: dataApple.email }, { uid: dataApple.sub, typeLogin: 'apple' }],
      });
      let firstLogin = !user;
      if (!user) {
        let userData = {
          email: dataApple.email,
          password: dataApple.sub,
          fullName: dataLogin.fullName.familyName || dataApple.sub.slice(0, 10),
          typeLogin: 'apple',
          uid: dataApple.sub,
          emailVerified: true,
        };

        let language = await LanguageModel.findOne({ locale: 'vi' });
        userData.language = language._id;
        let newUser = new UserModel(userData);
        newUser.setPassword(userData.password);
        user = await newUser.save();
      } else {
        let dataUpdate = {};
        !user.emailVerified && (dataUpdate.emailVerified = true);
        !user.uid && (dataUpdate.uid = dataApple.sub);
        user.typeLogin !== 'apple' && (dataUpdate.typeLogin = 'apple');
        if (Object.keys(dataUpdate).length > 0)
          await UserModel.findOneAndUpdate(
            {
              _id: user._id,
            },
            dataUpdate,
          );
      }
      let token = await helper.generateToken({
        payload: { id: user._id, email: user.email, uid: user.uid },
        remember: true,
        type: 'token',
      });

      let refreshToken = await helper.generateToken({
        payload: {
          id: user._id,
          email: user.email,
          uid: user.uid,
        },
        remember: false,
        type: 'refresh',
      });

      let data = user.jsonData();
      data.token = token;
      data.refreshToken = refreshToken;
      data.firstLogin = firstLogin;
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async loginGoogle(req, res, next) {
    try {
      let { accessToken } = req.body;
      if (!accessToken) return next(createError.UnprocessableEntity('access-token-is-require'));

      let dataGoogle = await Fetch.get({
        path: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`,
        credentials: 'include',
      });
      if (!dataGoogle.sub) return next(createError.UnprocessableEntity('google-login-failed'));

      let user = await UserModel.findOne({
        $or: [{ email: dataGoogle.email }, { uid: dataGoogle.sub, typeLogin: 'google' }],
      });
      let firstLogin = !user;
      if (!user) {
        let userData = {
          email: dataGoogle.email,
          password: dataGoogle.sub,
          avatar: dataGoogle.picture
            ? `${dataGoogle.picture.split('=').slice(0, -1).join('')}=s300`
            : '',
          fullName: dataGoogle.name || dataGoogle.sub.slice(0, 10),
          typeLogin: 'google',
          uid: dataGoogle.sub,
          emailVerified: true,
        };
        let language = await LanguageModel.findOne({ locale: 'vi' });
        userData.language = language._id;
        let newUser = new UserModel(userData);
        newUser.setPassword(userData.password);
        user = await newUser.save();
      } else {
        let dataUpdate = {};
        !user.emailVerified && (dataUpdate.emailVerified = true);
        !user.uid && (dataUpdate.uid = dataGoogle.sub);
        user.typeLogin !== 'google' && (dataUpdate.typeLogin = 'google');
        if (Object.keys(dataUpdate).length > 0)
          await UserModel.findOneAndUpdate(
            {
              _id: user._id,
            },
            dataUpdate,
          );
      }

      let token = await helper.generateToken({
        payload: { id: user._id, email: user.email, uid: user.uid },
        remember: true,
        type: 'token',
      });

      let refreshToken = await helper.generateToken({
        payload: {
          id: user._id,
          email: user.email,
          uid: user.uid,
        },
        remember: false,
        type: 'refresh',
      });

      let data = user.jsonData();
      data.token = token;
      data.refreshToken = refreshToken;
      data.firstLogin = firstLogin;
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  static async phone(req, res, next) {
    try {
      let { uid, phone } = req.body;
      let user = await firebaseModule.getUserPhone({ uid, phone });
      if (!user) return next(createError.NotFound('user-phone-not-found'));

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = AuthController;
