const fs = require('fs');
const moment = require('moment');

module.exports = {
  logEvent: function (message) {
    try {
      let folderName = `${__appRoot}/logs`;
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName, { recursive: true });
      }

      let fileName = `${folderName}/${moment().format('DD/MM/YYYY').replaceAll('/', '-')}.log`;
      let timeLog = moment().format('hh:mm:ss A');
      let content = `${timeLog} --> ${message}\n`;
      fs.appendFileSync(fileName, content);
    } catch (error) {
      console.log('logEvent error:::', error);
    }
  },
};
