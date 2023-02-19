const createError = require('http-errors');

class MediaController {
  static async get(req, res, next) {
    try {
      let { id, file } = req.params;
      let url = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/${id}/${file}`;
      return res.redirect(url);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }
}

module.exports = MediaController;
