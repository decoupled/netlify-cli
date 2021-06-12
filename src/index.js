const process = require('process')

const updateNotifier = require('update-notifier')

const pkg = require('../package.json')

const ide = require('./utils/ide/ide')

// 12 hours
const UPDATE_CHECK_INTERVAL = 432e5

// performance optimization to disable built in oclif TypeScript support
// see https://github.com/oclif/config/blob/1066a42a61a71b9a0708a2beff498d2cbbb9a3fd/src/ts-node.ts#L51
// oclif registers ts-node which can be quite slow
process.env.OCLIF_TS_NODE = '0'

if (!ide.isActive()) {
  try {
    updateNotifier({
      pkg,
      updateCheckInterval: UPDATE_CHECK_INTERVAL,
    }).notify()
  } catch (error) {
    console.log('Error checking for updates:')
    console.log(error)
  }
}

module.exports = require('@oclif/command')
