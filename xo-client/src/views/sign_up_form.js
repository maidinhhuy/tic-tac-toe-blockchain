'use strict'

const m = require('mithril')
const _ = require('lodash')

const forms = require('../components/forms')
const api = require('../services/api')
const transactions = require('../services/transactions')


const userSubmitter = state => e => {
  e.preventDefault()
  const keys = transactions.makePrivateKey(state.password)
  const user = _.assign(keys, state)
  api.post('/users', user)
    .then(res => api.setAuth(res.authorization))
    .then(() => m.route.set('/'))
    .catch(err => {
      console.error('Error create user: ', err)
      alert('Error auth')
    })
}


const passwordCard = state => {
  const setter = forms.stateSetter(state)
  const validator = forms.validator(
    () => state.password === state.confirm,
    'Passwords do not match',
    'confirm'
  )
  const passwordField = (id, placeholder) => {
    return forms.field(
      // Run both state setting and validation on value changes
      _.flow(setter(id), validator),
      {
        id,
        placeholder,
        type: 'password',
        class: 'border-warning'
      }
    )
  }

  return forms.group('Password', [
    m('.card.text-center.border-warning',
      m('.card-header.text-white.bg-warning', m('em', m('strong', 'WARNING!'))),
      m('.card-body.text-warning.bg-light',
        m('p.card-text',
          'This password will be used as a secret key to encrypt important ',
          'account information. Although it can be changed later, ',
          m('em',
            'if lost or forgotten it will be ',
            m('strong', 'impossible'),
            ' to recover your account.')),
        m('p.card-text', 'Keep it secure.'),
        passwordField('password', 'Enter password...'),
        passwordField('confirm', 'Confirm password...')))
  ])
}

/**
 * The Form for authorizing an existing user.
 */
const SignUpForm = {
  view (vnode) {
    const setter = forms.stateSetter(vnode.state)
    return m('.signup-form.md-col-4', [
      m('form', { onsubmit: userSubmitter(vnode.state) },
      forms.textInput(setter('username'), 'Username'),
      forms.textInput(setter('firstName'), 'First Name'),
      forms.textInput(setter('lastName'), 'Last Name'),
      passwordCard(vnode.state),
      m('.container.text-center'),
      m('.form-group',
        m('.row.justify-content-end.align-items-end',
          m('col-2',
            m('button.btn.btn-primary',
              'Sign Up')))))
    ])
  }
}



module.exports = SignUpForm
