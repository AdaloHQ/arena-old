
const cron = require('node-cron')
const { IncomingWebhook } = require('@slack/webhook');

const ONE_X = '1x'
const TWO_X = '2x'
const FIVE_X = '5x'
const TEN_X = '10x'

const getNumberOfJobs = (limit, scale) => {
  if (scale === ONE_X) {
    return limit
  } else if (scale === TWO_X) {
    return limit * 2
  } else if (scale === FIVE_X) {
    return limit * 5
  } else if (scale === TEN_X) {
    return limit * 10
  }
}

const createSlackCron = async (queues) => {
  const notified = {
    [ONE_X]: false,
    [TWO_X]: false,
    [FIVE_X]: false,
    [TEN_X]: false,
  }

  // Runs every 5 seconds
  await cron.schedule('*/5 * * * * *', async () => {
    const queue = await queues.get('adalo-compile', 'Compile Queue');

    if (queue && queue.IS_BEE) {
      const jobCounts = await queue.checkHealth();
      const limit = process.env.SLACK_CRON_LIMIT
      const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK)

      const sendSlackWarning = async scale => {
        const limitOfJobs = getNumberOfJobs(limit, scale)
        console.log(jobCounts.waiting)
        if (jobCounts.waiting < limitOfJobs && notified[scale]) {
          await webhook.send({ text: `${limitOfJobs <= 100 ? '🥳 ' : ''}🔽 The compile queue has gone down. It now has less than ${limitOfJobs} jobs in it!` })
          notified[scale] = false
        }
  
        if (jobCounts.waiting >= limitOfJobs && !notified[scale]) {
          await webhook.send({ text: `${limitOfJobs <= 100 ? '⚠️ ' : ''}🔼 The compile queue (editor saves backlog) has more than ${limitOfJobs} jobs waiting in it!` })
          notified[scale] = true
        }
      }
      
      await Promise.all([sendSlackWarning(ONE_X), sendSlackWarning(TWO_X), sendSlackWarning(FIVE_X), sendSlackWarning(TEN_X)])
    }

    return
  });
}

module.exports = {
  createSlackCron,
}