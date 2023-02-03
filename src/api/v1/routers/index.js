const middlewareAuth = require('~/api/v1/middlewares/auth-middleware');
const adminInit = require('@v1/routers/admin/admin-router');
const adminRouter = require('@v1/routers/admin');
const userRouter = require('@v1/routers/user');
const clientRouter = require('@v1/routers/client');

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
};
