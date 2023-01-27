const express = require('express');
const SettingController = require('@v1/controllers/admin/setting-controller');
const router = express.Router();

//language
router.post('/language/save', SettingController.languageSave);
router.get('/language/list', SettingController.languages);
router.delete('/language/delete/:id', SettingController.languageDelete);

module.exports = router;
