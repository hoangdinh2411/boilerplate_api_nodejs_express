const nodeCron = require('node-cron');

class CronJob {
  constructor() {
    nodeCron.schedule('* * * * * *', this.run);
  }

  async run() {
    console.log('run cronjob');
  }
}

module.exports = CronJob;
