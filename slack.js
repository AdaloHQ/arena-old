
const cron = require('node-cron')
const { IncomingWebhook } = require('@slack/webhook');

const createSlackCron = async (queues) => {
  let notified = false

  // Runs every 5 seconds
  await cron.schedule('*/5 * * * * *', async () => {
    const queue = await queues.get('adalo-compile', 'Compile Queue');

    if (queue && queue.IS_BEE) {
      const jobCounts = await queue.checkHealth();
      const limit = process.env.SLACK_CRON_LIMIT

      if (jobCounts.waiting < limit && notified) {
        notified = false
      }

      if (jobCounts.waiting >= limit && !notified) {
        const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK)
        await webhook.send({ text: `The compile queue has more than ${limit} jobs in it!` })
        notified = true
      }
    }
    return
  });
}

module.exports = {
  createSlackCron,
}