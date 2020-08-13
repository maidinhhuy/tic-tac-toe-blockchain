'use strict'

const m = require('mithril')
const sortBy = require('lodash/sortBy')
const truncate = require('lodash/truncate')
const {Table, FilterGroup, PagingButtons} = require('../components/tables')
const api = require('../services/api')

const PAGE_SIZE = 50

const GameList = {
  oninit (vnode) {
    vnode.state.games = []
    vnode.state.filteredAgents = []
    vnode.state.currentPage = 0

    const refresh = () => {
      api.get('/games').then((games) => {
        vnode.state.games = sortBy(games, 'name')
      })
    }

    refresh()
  },

  onbeforeremove (vnode) {
    clearTimeout(vnode.state.refreshId)
  },

  view (vnode) {
    return [
      m('.agent-list',
        m(Table, {
          headers: [
            'Name',
            'Status'
          ],
          rows: vnode.state.games.slice(
              vnode.state.currentPage * PAGE_SIZE,
              (vnode.state.currentPage + 1) * PAGE_SIZE)
            .map((game) => [
              m(`a[href=games/${game.name}]`, { oncreate: m.route.link },
                truncate(game.name, { length: 32 })),
                m('', game.status)
            ]),
          noRowsText: 'No agents found'
        })
     )
    ]
  }
}

module.exports = GameList
