'use strict'

const m = require('mithril')
const _ = require('lodash')

const forms = require('../components/forms')
const api = require('../services/api')
const transactions = require('../services/transactions')

const userSubmitter = state => e => {
  e.preventDefault()
  const keys = transactions.makePrivateKey(state.password)
  api.post('/authorization', state)
    .then(res => api.setAuth(res.authorization))
    .then(() => m.route.set('/'))
}

const SignInForm = {
  view (vnode) {
    const setter = forms.stateSetter(vnode.state)
    return m('.signup-form.md-col-4', [
      m('form', { onsubmit: userSubmitter(vnode.state) },
      forms.textInput(setter('username'), 'Username'),
      forms.passwordInput(setter('password'), 'Password'),      
      m('.container.text-center'),
      m('.form-group',
        m('.row.justify-content-end.align-items-end',
          m('col-2',
            m('button.btn.btn-primary',
              'Play now')))))
    ])
  }
}

module.exports = SignInForm