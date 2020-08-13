'use strict'

const m = require('mithril')
const api = require('../services/api')
const transactions = require('../services/transactions')



const Game = {
  oninit(vnode) {
    _loadData(vnode.attrs.name, vnode.state)
    vnode.state.refreshId = setInterval(() => {
      _loadData(vnode.attrs.name, vnode.state)
    }, 2000)
  },
  view(vnode) {
    if (!vnode.state.game) {
      return m('.alert-warning', `Loading ${vnode.attrs.name}`)
    }
    let { game, player1, player2 } = vnode.state
    let { board, name, status } = game

    return [
      m('.header.text-center.mb-4',
        m('h4', game.name),
        m('.label.label-warning', status ? status.replace('P1-', player1 + ' ').replace('P2-', player2 + ' ') : ''),
        m('.board',
          m('.row.row-cols-3',
            board.split('')
              .map((key, index) => m('.item', {
                onclick: e => {
                  let game = { name, action: 'take', space: index + 1 }
                  transactions.submit([game])
                    .then(res => {
                      console.log('Response submit transaction: ', res)
                    })
                }
              }, m(`span.${key}`, key !== '-' ? key : '')))),
        ),
        m('.row.row-cols-3',
          m('h4', (player1 || 'Player 1') + '(X)'),
          m('', 'vs'),
          m('h4', (player2 || 'Player 2') + '(O)'))
      )
    ]
  }
}

const displayName = ({ firstName, lastName }) => `${firstName} ${lastName}`


const _loadData = (name, state) => {
  return api.get(`/games/${name}`)
    .then(game => {
      return Promise.all([game, game.player1 ? api.get(`/users/${game.player1}`).then(displayName) : null, game.player2 ? api.get(`/users/${game.player2}`).then(displayName) : null])
    })
    .then(results => {
      console.log('results: ', results)
      state.game = results[0]
      state.player1 = results[1]
      state.player2 = results[2]
    })
}

module.exports = Game