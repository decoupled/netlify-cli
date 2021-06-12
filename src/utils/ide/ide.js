/* eslint-disable id-length, func-style, no-unused-vars */

const process = require('process')
const readline = require('readline')

const fetch = require('node-fetch')

/**
 * This module establishes a communication channel with VSCode
 * when the Netlify CLI is executed in the VSCode integrated terminal
 * by the VSCode extension.
 *
 * It exposes a series of methods that trigger UI changes
 * in the editor.
 */

/**
 * This env var is set by the VSCode extension.
 * This is how we can tell
 */
const isActive = typeof process.env.NETLIFY_VSCODE_RPC === 'string'

module.exports.info = (...args) => rpc({ x: ['info', ...args] })

module.exports.warn = (...args) => rpc({ x: ['warn', ...args] })

module.exports.error = (...args) => rpc({ x: ['error', ...args] })

module.exports.focusOnFile = (...args) => rpc({ x: ['focusOnFile', ...args] })

module.exports.withProgress = async (title, task) => {
  if (!isActive) return await task()
  const res = await rpc({ x: ['withProgress', title] })
  try {
    return await task()
  } finally {
    rpc({ x: ['withProgress_end', res.x] })
  }
}

module.exports.command = (commandID, ...args) => rpc({ x: ['command', commandID, ...args] })

module.exports.input = (opts) => {
  // TODO: validate
  const { validate, ...rest } = opts
  const opts2 = { type: 'input', ...rest }
  return new Promise((resolve, reject) => {
    const rl = createRL()
    rl.question(`>>>ide>>>${JSON.stringify(opts2)}`, (answer) => {
      checkAbort(answer)
      resolve(answer)
      rl.close()
    })
  })
}

// https://code.visualstudio.com/api/references/vscode-api#window.showQuickPick

module.exports.pick = (items) => {
  const opts2 = { type: 'pick', items }
  return new Promise((resolve, reject) => {
    const rl = createRL()
    rl.question(`>>>ide>>>${JSON.stringify(opts2)}`, (answer) => {
      checkAbort(answer)
      const idx = Number.parseInt(answer)
      resolve(items[idx])
      rl.close()
    })
  })
}

module.exports.isActive = () => isActive

function checkAbort(x) {
  if (x === '>>>ide-abort>>>') {
    process.exit(0)
  }
}

function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

async function rpc(data) {
  if (!isActive) return
  const url = `http://localhost:${process.env.NETLIFY_VSCODE_RPC}/rpc`
  const res = await fetch(url, {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  return await res.json()
}

/* eslint-enable id-length, func-style, no-unused-vars */
