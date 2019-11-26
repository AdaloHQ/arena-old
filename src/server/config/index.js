require('dotenv').config()

module.exports = {
  "__example_queues": [
    {
      "name": "my_queue",
      "port": 6381,
      "host": "127.0.0.1",
      "hostId": "AWS Server 2"
    }
  ],
  "queues": [
    {
      "type": "bee",
      "name": "adalo-compile",
      "host": process.env.REDIS_HOST,
      "port": process.env.REDIS_PORT,
      "password": process.env.REDIS_PASSWORD,
      "hostId": "Compile Queue",
    },
    {
      "type": "bee",
      "name": "proton-database-updates",
      "host": process.env.REDIS_HOST,
      "port": process.env.REDIS_PORT,
      "password": process.env.REDIS_PASSWORD,
      "hostId": "Updates Queue",
    }
  ]
}
