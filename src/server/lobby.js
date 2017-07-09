const _ = require('lodash')
const buildMessage = require('../buildMessage')
require('colors')

class Lobby {
  constructor() {
    this.players = []
  }

  size() {
    return this.players.length
  }

  join(socket) {
    this.players.push({
      id: this.size(),
      name: `Player ${this.size() + 1}`,
      socket: socket,
    })

    return _.last(this.players)
  }

  static reject(socket) {
    socket.write('noroom\n')
    socket.end()
  }

  whisper(id, ...args) {
    const text = buildMessage(args)
    const player = this.players[id]

    console.log(`@${player.name}: ${text}`.cyan)
    player.socket.write(`${text}\n`)
  }

  broadcast(...args) {
    const text = buildMessage(args)

    console.log(`@all: ${text}`)
    this.players.forEach(function ({ socket }) {
      socket.write(`${text}\n`)
    })
  }
}

module.exports = Lobby
