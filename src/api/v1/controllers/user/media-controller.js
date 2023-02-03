const fs = require('fs');
const rimraf = require('rimraf');
const convert = require('heic-convert');
const { promisify } = require('util');
const { cloudinary } = require('~/plugins/upload-plugin');
const Helper = require('@v1/helpers/index');
const MediaModel = require('@v1/models/media-model');

class MediaController {
  static async upload(req, res, next) {
    try {
      let result = [];
      await Promise.all(
        req.files.map(async (file) => {
          let filename = file.filename;
          let regMimetype = new RegExp(/\.heic$/);
          if (regMimetype.test(file.path)) {
            const inputBuffer = await promisify(fs.readFile)(file.path);
            const outputBuffer = await convert({
              buffer: inputBuffer, // the HEIC file buffer
              format: 'JPEG', // output format
              quality: 1, // the jpeg compression quality, between 0 and 1
            });
            let newF = file.path.replace('.heic', '.jpg');
            filename = filename.replace('.heic', '.jpg');
            await promisify(fs.writeFile)(newF, outputBuffer);
            fs.unlinkSync(file.path);
          }
          let data = await cloudinary.uploader.upload(file.path);
          let reg = new RegExp(`/upload/(v[0-9]+)/(${data.public_id}.*)`);
          let regExec = reg.exec(data.url);
          let path = `${process.env.MEDIA_PUBLISH}/cloud/${process.env.CLOUD_NAME}/uid/${regExec[1]}/${regExec[2]}`;
          let media = await MediaModel.create({
            path,
            size: file.size,
            mimetype: file.mimetype,
            name: filename,
            createdBy: req.payload.id,
            uid: regExec[1],
          });
          result.push({
            path: media.path,
            mimetype: media.mimetype,
            name: media.name,
            size: media.size,
          });
        }),
      );
      let tmp = `${appRoot}/public/media/cloud/${req.payload.id}-${Helper.getFolderNameByMonth()}`;
      rimraf.sync(`${tmp}/*`);
      fs.rmdirSync(tmp);
      return res.status(200).send(result.length > 1 ? result : result[0]);
    } catch (error) {
      console.error(error);
      return next(createError.BadRequest(error.message));
    }
  }

  // static async cloudSingle(req, res, next) {
  //   try {
  //     let reg = new RegExp(`/upload/(v[0-9]+)/(${req.file.filename}.*)`);
  //     let regExec = reg.exec(req.file.path);
  //     let media = await MediaModel.create({
  //       path: `${process.env.MEDIA_PUBLISH}/cloud/${process.env.CLOUD_NAME}/uid/${regExec[1]}/${regExec[2]}`,
  //       size: req.file.size,
  //       mimetype: req.file.mimetype,
  //       name: req.file.filename,
  //       created_by: req.payload.id,
  //       uid: regExec[1],
  //     });
  //     return res.status(200).send({
  //       path: media.path,
  //       mimetype: media.mimetype,
  //       name: media.name,
  //       size: media.size,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return next(createError.BadRequest(error.message));
  //   }
  // }
}

module.exports = MediaController;
