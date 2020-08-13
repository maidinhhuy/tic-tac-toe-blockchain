'use strict'

const db = require('../db/game')

const query = () => {
  return db.query(games => games)
}

const fetchGame = ({name}) => {
  return db.query(games => {
    return games.get(name)
  }, false)
}

module.exports = {
  query,
  fetchGame
}
