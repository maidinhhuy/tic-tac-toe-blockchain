'use strict'

const _ = require('lodash')
const blocks = require('../db/blocks')
const { addGame } = require('../db/state')

const deltaQueue = {
  _queue: [],
  _running: false,

  add(promisedFn) {
    this._queue.push(promisedFn)
    this._runUntilEmpty()
  },

  _runUntilEmpty() {
    if (this._running) return
    this._running = true
    this._runNext()
  },

  _runNext() {
    if (this._queue.length === 0) {
      this._running = false
    } else {
      const current = this._queue.shift()
      return current().then(() => this._runNext())
    }
  }
}

const handle = (block, changes) => {
  deltaQueue.add(() => {
    return Promise.all(
      changes.map(change => {
        if (change.value) {
          let strings = change.value.toString().split(',')
          return {
            name: strings[0],
            board: strings[1],
            status: strings[2],
            player1: strings[3],
            player2: strings[4]
          }
        }
      })
    ).then(games => {
      return Promise.all(games.map(game => addGame(game, block.blockId)))
    })
    .then(() => blocks.insert(block))
  })
}

module.exports = {
  handle
}