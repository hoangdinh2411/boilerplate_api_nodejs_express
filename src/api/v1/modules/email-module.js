const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const EmailTemplate = require('@v1/models/email-template-model');
const myOAuth2Client = new OAuth2Client(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
);
myOAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

class EmailModule {
  constructor(keyword, language, to) {
    this.keyword = keyword;
    this.language = language;
    this.to = to;
  }

  async sendEmail({ codeForgotPassword, email, fullName, amount, codeOtp }) {
    let transporter = await this.generateTransporter();
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
    let info = await transporter.sendMail({
      from,
      to: this.to,
      subject,
      html: body,
    });
    console.log(info);
    return info;
  }

  async generateTransporter() {
    const accessTokenObject = await myOAuth2Client.getAccessToken();
    const accessToken = accessTokenObject?.token;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    return transporter;
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
