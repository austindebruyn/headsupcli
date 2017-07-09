const buildMessage = require('../buildMessage')
require('colors')

class Lobby {
  constructor() {
    this.sockets = []
  }

  size() {
    return this.sockets.length
  }

  join(socket) {
    this.sockets.push(socket)
  }

  static reject(socket) {
    socket.write('noroom\n')
    socket.end()
  }

  whisper(id, ...args) {
    const text = buildMessage(args)
    const socket = this.sockets[id]

    console.log(`@${socket.player.name}: ${text}`.cyan)
    socket.write(`${text}\n`)
  }

  broadcast(...args) {
    const text = buildMessage(args)

    console.log(`@all: ${text}`)
    this.sockets.forEach(function (socket) {
      socket.write(`${text}\n`)
    })
  }
}

module.exports = Lobby
