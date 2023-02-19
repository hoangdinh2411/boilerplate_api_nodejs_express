const express = require('express');
const { uploadCloud } = require('~/plugins/upload-plugin');
const MediaController = require('@v1/controllers/user/media-controller');
const router = express.Router();

// router.post("/media/cloud", uploadCloud.single("file"), MediaController.cloudSingle);
router.post('/upload', uploadCloud.array('image'), MediaController.upload);

module.exports = router;
