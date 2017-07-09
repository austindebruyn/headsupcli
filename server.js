const lex = require('./src/lex')
const net = require('net')
const carrier = require('carrier')
const Game = require('./src/game')
const Lobby = require('./src/server/lobby')
const Interpreter = require('./src/interpreter')
require('colors')

const game = new Game()
const lobby = new Lobby()

const server = net.createServer(function (socket) {
  if (lobby.size() === 2) {
    lobby.reject(socket)
    return
  }

  const player = lobby.join(socket)
  lobby.whisper(player.id, 'id', player.id)

  console.log(`${player.name} has joined from ${socket.address().address}`)

  carrier.carry(socket, function (message) {
    const tokens = lex(message)
    const interpreter = new Interpreter()

    console.log(`[${player.name}] ${message}`)

    interpreter.rule('act', function () {
      game.state.activePlayer = 1
      game.state.pot += game.state.bb
      game.state.players[0].balance -= game.state.bb
      lobby.broadcast('hydrate', game.state)
    })
    .rule('setname', function (name) {
      player.name = name
    })

    if (!interpreter.go(tokens)) {
      console.log(`bad message '${tokens[0]}' from client`)
    }
  })

  if (lobby.size() === 2) {
    game.start()
    lobby.broadcast('begin')
    lobby.broadcast('hydrate', game.state)
  }
})

server.listen(23456, '127.0.0.1', function () {
  console.log('Server listening on 127.0.0.1:23456')
})
