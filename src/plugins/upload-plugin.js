const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Helper = require('@v1/helpers/index');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storageSingle = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png', 'jpeg', 'heic', 'gif'],
  filename: function (req, file, cb) {
    let fileName = Helper.generateFileName(file.originalname, file.mimetype);
    cb(null, fileName);
  },
});

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      let fileDir = `${__appRoot}/public/media/${req.payload.id}-${Helper.getFolderNameByMonth()}`;
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      cb(null, `${fileDir}`);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    let fileName = Helper.generateFileName(file.originalname, file.mimetype);
    cb(null, fileName);
  },
});

const uploadCloud = multer({
  storage,
  limits: {
    fileSize: 20480 * 1024 * 1024,
    files: 10,
  },
  fileFilter: async (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/heic'].includes(file.mimetype))
      return cb(new Error('incorrect-file-format'), false);
    return cb(null, true);
  },
});

module.exports = { uploadCloud, cloudinary };
