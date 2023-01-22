const settingValidate = require('@v1/validations/setting-validate');
const LanguageModel = require('@v1/models/language-model');
const SettingModel = require('@v1/models/setting-model');

class SettingController {
  static async languages(req, res) {
    let { limit, page, name, locale } = req.query;
    if (!limit) limit = 20;
    if (!page) page = 1;

    let options = {};
    if (name) options.$text = { $search: name };
    if (locale) options.locale = locale;

    let skip = limit * page - limit;
    let languages = await LanguageModel.find(options).skip(skip).limit(limit).sort({
      sort: 1,
      updatedAt: -1,
    });

    let count = await LanguageModel.countDocuments(options);

    return res.status(200).send({
      count,
      list: languages,
    });
  }

  static async languageSave(req, res) {
    let { name, locale, id, image, sort } = req.body;
    if (!sort && isNaN(sort)) sort = 1;
    let data = {
      name,
      locale,
      image,
      sort,
      createdBy: req.payload.id,
    };
    try {
      await settingValidate.languageSave.validateAsync(data);
      let language;
      if (id) {
        language = await LanguageModel.findOneAndUpdate({ _id: id }, data);
      } else language = await LanguageModel.create(data);

      return res.status(200).send(language);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async languageDelete(req, res) {
    let { id } = req.params;

    let language = await LanguageModel.findOne({ _id: id });
    if (!language) return res.status(404).send({ error: 'language-not-found' });

    let deleteOne = await LanguageModel.deleteOne({ _id: id });

    return res.status(200).send(deleteOne);
  }

  static async settingSave(req, res) {
    let setting = await SettingModel.create({});

    return res.status(200).send(setting);
  }
}

module.exports = SettingController;
