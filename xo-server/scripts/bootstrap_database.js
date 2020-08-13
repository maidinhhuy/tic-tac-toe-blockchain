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

const r = require('rethinkdb')
const config = require('../system/config')

const HOST = config.DB_HOST
const PORT = config.DB_PORT
const NAME = config.DB_NAME

r.connect({host: HOST, port: PORT})
  .then(conn => {
    console.log(`Creating "${NAME}" database...`)
    r.dbList().contains(NAME).run(conn)
      .then(dbExists => {
        if (dbExists) throw new Error(`"${NAME}" already exists`)
        return r.dbCreate(NAME).run(conn)
      })
      .then(() => {
        console.log('Creating "users" table...')
        return r.db(NAME).tableCreate('users', {
          primaryKey: 'publicKey'
        }).run(conn)
      })
      .then(() => {
        // The usernames table is used to quickly ensure unique usernames
        console.log('Creating "games" table...')
        return r.db(NAME).tableCreate('games', {
          primaryKey: 'name',
        }).run(conn)
      })
      .then(() => {
        console.log('Creating "blocks" table...')
        return r.db(NAME).tableCreate('blocks', {
          primaryKey: 'blockNum'
        }).run(conn)
      })
      .then(() => {
        console.log('Bootstrapping complete, closing connection.')
        return conn.close()
      })
      .catch(err => {
        console.log(`Unable to bootstrap "${NAME}" db: ${err.message}`)
        return conn.close()
      })
  })
  .catch(err => {
    console.log(`Unable to connect to db at ${HOST}:${PORT}}: ${err.message}`)
  })
