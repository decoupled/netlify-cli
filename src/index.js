const updateNotifier = require('update-notifier')

const pkg = require('../package.json')

const ide = require('./utils/ide/ide')

// 12 hours
const UPDATE_CHECK_INTERVAL = 432e5

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
