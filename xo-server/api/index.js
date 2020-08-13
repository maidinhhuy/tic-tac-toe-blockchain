'use strict'

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {BadRequest, Unauthorized} = require('./errors')

const blockchain = require('../blockchain')
const batcher = require('../blockchain/batcher')
const config = require('../system/config')

const auth = require('./auth')

const games = require('./game')

const users = require('./users')

const router = express.Router()

// Passes a request to a function, then sends back the promised result as JSON
// Will catch errors and send on to any error handling middleware
const handlePromisedResponse = func => (req, res, next) => {
  func(req)
    .then(filterQueryParams(req.query))
    .then(result => res.json(result))
    .catch(err => next(err))
}

// Handler suitable for all GET requests. Passes the endpoint function
// a merged copy of the parameters for a request, handling promised results
const handle = func => handlePromisedResponse(req => {
  return func(_.assign({}, req.query, req.params, req.internal))
})

// Handler suitable for POST/PATCH request, passes along the request's body
// in addition to it's other parameters

const handleBody = func => handlePromisedResponse(req => {
  return func(req.body, _.assign({}, req.query, req.params, req.internal))
})

const filterQueryParams = ({fields, omit}) => result => {
  const filterParams = obj => fields? _.pick(obj, fields.split(','))
    : omit ? _.omit(obj, omit.split(','))
      : obj
  
  return Array.isArray(result) ? _.map(result, filterParams) : filterParams(result)
}

// Parses the endpoints from and Express router

const getEndpoints = router => {
  return _.chain(router.stack)
    .filter(layer => layer.route)
    .map(({route}) => {
      return _.chain(route.stack)
        .reduceRight((layers, layer) => {
          if(layer.name === 'restrict') {
            _.nth(layers, -1).restricted = true
          } else {
            layers.push({
              path: route.path,
              method: layer.method.toUpperCase(),
              restricted: false
            })
          }
          return layers
        }, [])
        .reverse()
        .value()
    })
    .flatten()
    .value()
}

// Custom Middleware

// Logs basic request information to the console
const logRequest = (req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url} from ${req.ip}`)
  next()
}

// Adds an object to the reqest for storing internally generated parameters
const initInternalParams = (req, res, next) => {
  req.internal = {}
  next()
}

// Middleware for parsing the wait query parameter
const waitParser = (req, res, next) => {
  const DEFAULT_WAIT = Math.floor(config.DEFAULT_SUBMIT_WAIT / 1000)
  const parsed = req.query.wait === '' ? DEFAULT_WAIT : Number(req.query.wait)
  req.query.wait = _.isNaN(parsed) ? null : parsed
  next()
}
// Check the Authorization header if present
// Saves the encoded public key to the request object.
const authHandler = (req, res, next) => {
  req.internal.authedKey = null
  const token = req.headers.authorization
  if (!token) return next()

  auth.verifyToken()
    .then(publicKey => {
      req.internal.authedKey = publicKey
      next()
    })
    .catch(() => next())
}

// Route-specific middleware, throws error if not authorized
const restrict = (req, res, next) => {
  if (req.internal.authedKey) {
    return next()
  }
  next (new Unauthorized('This route requires a valid Authorization header'))
}

// Send back a simple JSON error with and HTTP status code
const errorHandler  = (err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).json({error: err.message})
  } else {
    next()
  }
}

// Route and Middleware setup

router.use(bodyParser.json({type: 'application/json'}))
router.use(bodyParser.raw({type: 'application/octet-stream'}))

router.use(logRequest)
router.use(initInternalParams)
router.use(waitParser)
router.use(authHandler)

router.get('/info', handle(() => {
  return Promise.resolve()
    .then(() => ({
      pubkey: batcher.getPublicKey(),
      endpoints: endpointInfo
    }))
}))

router.post('/transactions', handleBody(blockchain.submit))

router.post('/authorization', handleBody(auth.authorize))

router.use(errorHandler)
router.route('/users')
  .post(handleBody(users.create))
  
router.get('/users/:publicKey', handle(users.fetch))

router.get('/games', handle(games.query))

router.get('/games/:name', handle(games.fetchGame))
const endpointInfo = getEndpoints(router)

module.exports = router