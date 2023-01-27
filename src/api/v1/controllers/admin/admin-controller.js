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

  static async createInit(req, res) {
    let existed = await AdminModel.findOne({
      username: process.env.ADMIN_ACCOUNT_EMAIL,
    });
    if (existed) return res.status(422).json({ error: 'username-exists' });
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
        console.log(error);
      });
  }

  static async login(req, res, next) {
    let { username, password, remember } = req.body;
    if (!remember) remember = false;

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if (err) return next(createError.Unauthorized(err));
      if (passportUser) return res.json(passportUser.jsonData(remember));
      return next(createError.BadRequest(info));
    })(req, res, next);
  }
}

module.exports = AdminController;
