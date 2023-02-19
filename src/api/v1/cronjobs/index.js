const nodeCron = require('node-cron');
const CronJob = require('@v1/cronjobs/cronjob');

class CronJobs {
  static init() {
    new CronJob();
    console.log(`[CRONJOB] Have ${nodeCron.getTasks().length} task(s) is running.`);
  }
}

module.exports = CronJobs;
