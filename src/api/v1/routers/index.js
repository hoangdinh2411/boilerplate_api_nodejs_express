const middlewareAuth = require('@v1/middlewares/auth-middleware');
const adminInit = require('@v1/routers/admin/admin-router');
const adminRouter = require('@v1/routers/admin/index');
const userRouter = require('@v1/routers/user/index');
const clientRouter = require('@v1/routers/client/index');

module.exports = function (app) {
  // Admin
  app.use('/admin', adminInit);
  app.use('/admin', middlewareAuth.admin);
  app.use('/admin', adminRouter);
  // User
  app.use('/user', middlewareAuth.user);
  app.use('/user', userRouter);
  // Client
  app.use('/client', middlewareAuth.optional);
  app.use('/client', clientRouter);

  app.use('/test', (req, res) => {
    return res.status(200).json({ message: 'test success' });
  });
};
