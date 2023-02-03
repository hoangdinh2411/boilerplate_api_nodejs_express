const NotificationModel = require('@v1/models/`notification-model');
const NotificationTemplateModel = require('@v1/models/notification-template-model');

module.exports = {
  send_now: async function ({ type, key, typeSend, params = [], action = {} }, data) {
    try {
      let template = await NotificationTemplateModel.findOne({
        keyword: key,
        status: 'active',
      });
      if (!template) return;

      let { contents } = JSON.parse(JSON.stringify(template));
      contents.map((content) => {
        for (const [k, v] of Object.entries(content)) {
          content[k] = this.replaceContent(v, data);
        }
        return content;
      });

      await NotificationModel.create({
        status: 'send',
        type,
        typeSend,
        contents,
        params,
        action,
      });
    } catch (error) {
      console.error('send notify error : ', error);
    }
    return;
  },
  replaceContent: function (content, { fullName, email, amount }) {
    if (!content) return '';
    return content.replace(/{{([^{}]+)}}/g, (keyExpr, key) => {
      switch (key) {
        case 'FULL_NAME':
          return fullName;
        case 'EMAIL':
          return email;
        case 'AMOUNT':
          return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'VND',
          }).format(amount);
      }
    });
  },
};
