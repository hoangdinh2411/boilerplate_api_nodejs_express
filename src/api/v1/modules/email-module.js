const mailGun = require('mailgun-js')({
  apiKey: process.env.MAIL_GUN_TOKEN,
  domain: process.env.MAIL_GUN_DOMAIN,
});
const EmailTemplate = require('@v1/models/email-template-model');

class EmailModule {
  constructor(keyword, language, to) {
    this.keyword = keyword;
    this.language = language;
    this.mailGun = mailGun;
    this.to = to;
  }
  async send_email(
    { pathVerifyEmail, codeForgotPassword, email, fullName, appointmentTitle, amount },
    callback,
  ) {
    let template = await EmailTemplate.findOne({
      keyword: this.keyword,
    });

    let { from, subject, body } = template.contents.find((c) => c.language === this.language);
    subject = this.replaceContent(subject, {
      pathVerifyEmail,
      codeForgotPassword,
      email,
      fullName,
      appointmentTitle,
      amount,
    });

    body = this.replaceContent(body, {
      pathVerifyEmail,
      codeForgotPassword,
      email,
      fullName,
      appointmentTitle,
      amount,
    });
    return await this.mailGun.messages().send(
      {
        from,
        to: this.to,
        subject,
        html: body,
      },
      async (error, body) => {
        console.log('callback : ', error);
        if (!error && callback) callback();
      },
    );
  }
  replaceContent(
    content,
    { pathVerifyEmail, codeForgotPassword, email, fullName, appointmentTitle, amount },
  ) {
    return content.replace(/{{([^{}]+)}}/g, function (keyExpr, key) {
      switch (key) {
        case 'pathVerifyEmail':
          return pathVerifyEmail;
          break;
        case 'codeForgotPassword':
          return codeForgotPassword;
          break;
        case 'fullName':
          return fullName;
          break;
        case 'EMAIL':
          return email;
          break;
        case 'appointmentTitle':
          return appointmentTitle;
          break;
        case 'AMOUNT':
          return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'VND',
          }).format(amount);
          break;
      }
    });
  }
}

module.exports = EmailModule;
