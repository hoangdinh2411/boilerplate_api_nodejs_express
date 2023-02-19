const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const createError = require('http-errors');
const AdminModel = require('@v1/models/admin-model');

class AdminController {
  static async initPassport() {
    passport.use(
      'local',
      new localStrategy({}, (username, password, done) => {
        AdminModel.findOne({
          username,
          status: 1,
          role: {
            $in: ['superadmin', 'admin'],
          },
        })
          .then((admin) => {
            if (!admin || !admin.validatePassword(password)) {
              return done(null, false, 'email or password is invalid');
            }
            return done(null, admin);
          })
          .catch(done);
      }),
    );
  }

  static async createInit(req, res, next) {
    try {
      let exist = await AdminModel.findOne({
        username: process.env.ADMIN_ACCOUNT_EMAIL,
      });
      if (exist) return next(createError.Conflict('username-exist'));
      let newAdmin = new AdminModel({
        username: process.env.ADMIN_ACCOUNT_EMAIL,
        name: 'Admin',
        password: process.env.ADMIN_ACCOUNT_PASS,
        status: 1,
        role: 'superadmin',
      });
      newAdmin.setPassword(process.env.ADMIN_ACCOUNT_PASS);

      return newAdmin
        .save()
        .then(() => res.json({ name: process.env.ADMIN_ACCOUNT_EMAIL }))
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
    let { username, password, remember } = req.body;
    if (!remember) remember = false;

    return passport.authenticate('local', { session: false }, async (err, passportUser, info) => {
      if (err) return next(createError.Unauthorized(err));
      if (passportUser) {
        let admin = await passportUser.jsonData(remember);
        return res.json(admin);
      }
      return next(createError.BadRequest(info));
    })(req, res, next);
  }
}

module.exports = AdminController;
