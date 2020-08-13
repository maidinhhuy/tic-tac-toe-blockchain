'use strict'

const _ = require('lodash')
const db = require('../db/users')
const auth = require('./auth')
const {BadRequest} = require('./errors')

const create = user => {
  return Promise.resolve()
    .then(() => auth.hashPassword(user.password))
    .then(hashed => {
      return db.insert(_.assign({}, user, {password: hashed}))
        .catch(err => {throw new BadRequest(err.message)})
    })
    .then(() => auth.createToken(user.publicKey))
    .then(token => ({
      authorization: token,
    }))
}

const fetch = ({publicKey}) => db.query(users => {
  const user = users.get(publicKey).pluck('firstName', 'lastName')
  return user
}, false)

module.exports = {
  create,
  fetch
}
