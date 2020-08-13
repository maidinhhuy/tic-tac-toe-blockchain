'use strict'

const db = require('./db')
const subscriber = require('./subscriber')

Promise.all([
  db.connect(),
])
  .then(subscriber.start)
  .catch(err => console.error(err.message))
