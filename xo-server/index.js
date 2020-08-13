'use strict'

const express = require('express')
const blockchain = require('./blockchain')
const api = require('./api')
const config = require('./system/config')
const db = require('./db')

const PORT = config.PORT
const app = express()

var cors = require('cors')

Promise.all([
  db.connect(),
  blockchain.connect()
])
  .then(() => {
    app.use(cors())
    app.use('/', api)
    app.listen(PORT, () => {
      console.log(`XO Game server listening on port ${PORT}`)
    })
  })
  .catch(err => console.error(err.message))