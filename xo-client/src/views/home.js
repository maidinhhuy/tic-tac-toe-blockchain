'use strict'

const m = require('mithril')

const Home = {
  view(vnode) {
    return [
      m('.header.text-center.mb-4',
        m('h4', 'XO Game')
      )
    ]
  }
}

module.exports = Home