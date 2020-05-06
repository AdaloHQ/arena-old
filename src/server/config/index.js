require('dotenv').config()

const base = {
  type: 'bee',
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
}

module.exports = {
  queues: [
    {
      ...base,
      name: 'adalo-compile',
      hostId: 'Compile Queue',
    },
    {
      ...base,
      name: 'adalo-cert-valiation',
      hostId: 'Cert Validation',
    },
    {
      ...base,
      name: 'proton-database-updates',
      hostId: 'Updates Queue',
    },
    {
      ...base,
      name: 'adaloAndroidBuilds',
      hostId: 'Android Builds',
    },
    {
      ...base,
      name: 'adaloIOSBuilds',
      hostId: 'iOS Builds',
    },
    {
      ...base,
      name: 'iosCredentials',
      hostId: 'iOS Credentials',
    }
  ]
}
