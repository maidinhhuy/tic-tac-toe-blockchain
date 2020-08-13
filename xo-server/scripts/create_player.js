'use strict'
var cbor = require('cbor');
const {
  awaitServerPubkey,
  getTxnCreator,
  submitTxns
} = require('../system/sumit_utils')

awaitServerPubkey()
  .then(batcherPublicKey => getTxnCreator(null, batcherPublicKey))
  .then(createTxn => {
    let gamePayload = {
      name: 'laws',
      action: 'take',
      space: 6
    }
    const txns = [createTxn(cbor.encode(gamePayload))]
    return submitTxns(txns)
  })
  .then(res => console.log('Types submitted:\n', JSON.parse(res)))
  .catch(err => {
    console.error('error create transactions: ' ,err.toString())
    process.exit()
  })