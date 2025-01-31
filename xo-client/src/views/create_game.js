/**
 * Copyright 2017 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------------
 */
'use strict'

const m = require('mithril')
const _ = require('lodash')

const forms = require('../components/forms')
const api = require('../services/api')
const transactions = require('../services/transactions')


const userSubmitter = state => e => {
  e.preventDefault()
  let game = _.assign({}, _.pick(state, 'name'))
  game.action = 'create'
  game.space = 0
  transactions.submit([game])
    .then(() => m.route.set('/games'))

}

/**
 * The Form for authorizing an existing user.
 */
const CreateGameForm = {
  view (vnode) {
    const setter = forms.stateSetter(vnode.state)
    return m('.signup-form.md-col-4', [
      m('form', { onsubmit: userSubmitter(vnode.state) },
      forms.textInput(setter('name'), 'Name'),
      m('.container.text-center'),
      m('.form-group',
        m('.row.justify-content-end.align-items-end',
          m('col-2',
            m('button.btn.btn-primary',
              'Start')))))
    ])
  }
}

module.exports = CreateGameForm
