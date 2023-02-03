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

  async send_email({ codeForgotPassword, email, fullName, amount, codeOtp }, callback) {
    let template = await EmailTemplate.findOne({
      keyword: this.keyword,
    });

    let { from, subject, body } = template.contents.find((c) => c.language === this.language);
    subject = this.replaceContent(subject, {
      codeForgotPassword,
      email,
      fullName,
      amount,
      codeOtp,
    });

    body = this.replaceContent(body, {
      codeForgotPassword,
      email,
      fullName,
      amount,
      codeOtp,
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

  replaceContent(content, { codeForgotPassword, email, fullName, codeOtp, amount }) {
    return content.replace(/{{([^{}]+)}}/g, function (keyExpr, key) {
      switch (key) {
        case 'CODE_FORGOT_PASSWORD':
          return codeForgotPassword;
        case 'CODE_OTP':
          return codeOtp;
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
  }
}

module.exports = EmailModule;
