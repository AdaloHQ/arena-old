const cron = require('node-cron')
const Heroku = require('heroku-client')

const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })

const scaleWorkerDynos = async (queues) => {

  // run every 10 seconds
  await cron.schedule('*/10 * * * * *', async () => {
    const queue = await queues.get('adalo-compile', 'Compile Queue');
    const workerDetails = await heroku.get('/apps/proton-backend/formation/worker')
    const workerCount = workerDetails.quantity

    if (queue && queue.IS_BEE) {
      const jobCounts = await queue.checkHealth();
      let desiredWorkers = 25

      // nothing fancy here, just scale based on predefined queue size
      if (jobCounts.waiting > 25 && jobCounts.waiting <= 50) {
        desiredWorkers = 50
      }else if(jobCounts.waiting > 50 && jobCounts.waiting <= 75) {
        desiredWorkers = 75
      }else if (jobCounts.waiting > 75) {
        desiredWorkers = 100
      }

      if (workerCount != desiredWorkers) {
        // don't suddenly drop the number of workers from high low, drop by 10% each time
        if (workerCount > desiredWorkers) {
          desiredWorkers = ~~((workerCount - desiredWorkers)*0.9 + desiredWorkers)
        }
        const result = await heroku.patch('/apps/proton-backend/formation/worker',
                                              {body: { quantity: desiredWorkers } })
        if (result.status_code == 200) {
          console.log(`Scaling Workers, Waiting/Workers/Requested: ${jobCounts.waiting}/${workerCount}/${desiredWorkers}`)
        } else {
          console.error('Failed to scale workers')
        }
      }

    }
    return
  });
}

module.exports = {
  scaleWorkerDynos,
}
