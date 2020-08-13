'use strict'

const _ = require('lodash')
const r = require('rethinkdb')
const db = require('./')

const valueNames = {
  BYTES: 'bytesValue',
  BOOLEAN: 'booleanValue',
  NUMBER: 'numberValue',
  STRING: 'stringValue',
  ENUM: 'enumValue',
  LOCATION: 'locationValue'
}

const xformStruct = properties => {
  return _.fromPairs(properties.map(property => {
    const value = property.dataType === 'STRUCT'
      ? xformStruct(property.structValues)
      : property[valueNames[property.dataType]]
    return [property.name, value]
  }))
}

const addGame = (game, blockNum) => {
  db.modifyTable('games', games => {
    return games.get(game.name)
      .do(foundGame => {
        return r.branch(foundGame, games.update(game), games.insert(_.assign({},game, {startBlockNum: blockNum})))
      })
  })
}

module.exports = {
  addGame
}
