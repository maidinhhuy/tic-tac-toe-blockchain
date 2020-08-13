'use strict'

const _ = require('lodash')
const db = require('./')

const USER_SCHEMA = {
  username: String,
  password: String,
  publicKey: String,
}

// Modified user schema with optional keys
const UPDATE_SCHEMA = _.mapKeys(USER_SCHEMA, (_, key) => {
  if (key === '*' || key[0] === '?') return key
  return '?' + key
})

const query = (query, removeCursor) => db.queryTable('users', query, removeCursor)

const insert = user => {
  return db.validate(user, USER_SCHEMA)
    .then(() => db.insertTable('users', user))
    .catch(err => {
      // Delete user, before re-throwing error
      return db.modifyTable('users', users => {
        return users.get(user.publicKey).delete()
      })
        .then(() => { throw err })
    })
}

module.exports = {
  query,
  insert
}