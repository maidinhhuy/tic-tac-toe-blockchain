'use strict'
require('bootstrap')
require('../styles/main.scss')

const m = require('mithril')

const api = require('./services/api')
const transactions = require('./services/transactions')

const navigation = require('./components/navigation')

const Home = require('./views/home')
const SignUpForm = require('./views/sign_up_form')
const SignInForm = require('./views/sign_in_form')
const CreateGameForm = require('./views/create_game')
const GameList = require('./views/list_games')
const Game = require('./views/game')

/**
 * A basic layout component that adds the navbar to the view.
 */
const Layout = {
  view(vnode) {
    return [
      vnode.attrs.navbar,
      m('.content.container', vnode.children)
    ]
  }
}

const loggedInNav = (name) => {
  const links = [
    ['create-game', 'Create Game'],
    ['games', 'Games'],
  ]

  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.link('/profile', name),
    navigation.button('/logout', 'Logout')
  ])
}

const loggedOutNav = () => {
  const links = [
    ['board', 'Board'],
  ]
  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.button('sign-in', 'Sign In'),
    navigation.button('sign-up', 'Sign Up')
  ])
}


/**
 * Clears user info from memory/storage and redirects.
 */
const logout = () => {
  api.clearAuth()
  transactions.clearPrivateKey()
  m.route.set('/')
}

/**
 * Returns a route resolver which handles authorization related business
 */
const resolve = (view, restricted = false) => {

  const resolver = {}

  if (restricted) {
    resolver.onmatch = () => {
      if (api.getAuth()) return view
      m.route.set('/sign-in')
    }
  }

  let publicKey = api.getPublicKey()
  let name = null
  api.get(`/users/${publicKey}`)
    .then(user => {
      name = `${user.firstName} ${user.lastName}`
    })
  resolver.render = vnode => {
    if (api.getAuth()) {

      return m(Layout, { navbar: loggedInNav(name) }, m(view, vnode.attrs))
    }
    return m(Layout, { navbar: loggedOutNav() }, m(view, vnode.attrs))
  }

  return resolver
}

/**
 * Build and mount app/router
 */

document.addEventListener('DOMContentLoaded', () => {
  m.route(document.querySelector('#app'), '/', {
    '': resolve(GameList),
    'games/:name': resolve(Game),
    'sign-up': resolve(SignUpForm),
    'sign-in': resolve(SignInForm),
    'create-game': resolve(CreateGameForm),
    'games': resolve(GameList),

    'logout': { onmatch: logout },
  })
})