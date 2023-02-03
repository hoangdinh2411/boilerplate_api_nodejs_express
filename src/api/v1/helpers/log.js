const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = {
  logEvent: function (message) {
    try {
      const fileName = path.join(
        __dirname,
        '../../logs',
        `${moment().format('DD/MM/YYYY').replaceAll('/', '-')}.log`,
      );
      const timeLog = moment().format('hh:mm:ss A');
      const content = `${timeLog} --> ${message}\n`;
      fs.appendFileSync(fileName, content);
    } catch (error) {
      console.log('logEvent error:::', error);
    }
  },
};
