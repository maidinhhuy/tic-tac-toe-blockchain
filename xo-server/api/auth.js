'use strict'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {BadRequest, Unauthorized} =  require('./errors')
const config = require('../system/config')

const users = require('../db/users')

const SALT_ROUNDS = 10
const SECRET = config.JWT_SECRET

// Hashes password as a promised
const hashPassword = password => bcrypt.hash(password, SALT_ROUNDS)

// Creates a new JWT token as promised
const createToken = payload => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  })
}

// Verifies a token is valid as promised
// Sends back the decoded payload, or throws an error if invalid
const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  })
}

// Checks an object with username an password keys 
// Returns an auth token and the user's private key if it passes
const authorize = ({username, password}) => {
  console.log('Username: ', password)
  if (!username || !password) {
    const message = 'Authorization requires username and password'
    return Promise.reject(new BadRequest(message))
  }

  return users.query(users => users.filter({username}))
    .then(matches => {
      if (matches.length === 0) throw new Error()
      const user = matches[0]

      return bcrypt.compare(password, user.password)
        .then(passValid => {
          console.log('password valid: ', passValid)
          if (!passValid) throw new Error()
          return createToken(user.publicKey)
        })
        .then(token => ({
          authorization: token,
          encryptedKey: user.encryptedKey
        }))
    })
    .catch(e => {
      console.log('Error auth: ', e)
      throw new Unauthorized('Authorization failed')
    })
}

module.exports = {
  hashPassword,
  createToken,
  verifyToken,
  authorize
}