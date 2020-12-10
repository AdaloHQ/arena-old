const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const basicAuth = require('express-basic-auth');
const { createSlackCron } = require('../../slack')
const { scaleWorkerDynos } = require('../../workerscale')

module.exports = async function() {
  const hbs = exphbs.create({
    defaultLayout: `${__dirname}/views/layout`,
    handlebars,
    partialsDir: `${__dirname}/views/partials/`,
    extname: 'hbs'
  });

  require('handlebars-helpers')({handlebars});

  const app = express();

  const defaultConfig = require(path.join(__dirname, 'config'));

  const Queues = require('./queue');

  const queues = new Queues(defaultConfig);
  require('./views/helpers/handlebars')(handlebars, { queues });
  app.locals.Queues = queues;
  app.locals.appBasePath = '';
  app.locals.vendorPath = '/vendor';

  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'hbs');
  app.set('json spaces', 2);

  app.engine('hbs', hbs.engine);

  app.use(bodyParser.json());

  if (process.env.AUTH_USERNAME) {
    console.log('BASIC AUTH WITH', process.env.AUTH_USERNAME, process.env.AUTH_PASSWORD)

    app.use(basicAuth({
      users: { [process.env.AUTH_USERNAME]: process.env.AUTH_PASSWORD },
      challenge: true,
    }));
  }

  if (process.env.SLACK_WEBHOOK && process.env.SLACK_CRON_LIMIT) {
    await createSlackCron(queues);
  }

  if (process.env.HEROKU_API_TOKEN) {
    await scaleWorkerDynos(queues);
  }

  return {
    app,
    Queues: app.locals.Queues
  };
};
