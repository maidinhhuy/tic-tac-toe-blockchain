'use strict'

const _ = require('lodash')
const db = require('./')

const query = (query, removeCursor) => db.queryTable('games', query, removeCursor)

module.exports = {
  query
}