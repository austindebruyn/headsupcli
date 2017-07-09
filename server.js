const net = require('net')
const carrier = require('carrier')
const Game = require('./src/game')
const Lobby = require('./src/server/lobby')
const interpret = require('./src/server/interpret')
require('colors')

const game = new Game()
const lobby = new Lobby()

const server = net.createServer(function (socket) {
  if (lobby.size() === 2) {
    lobby.reject(socket)
    return
  }

  const player = {}
  player.id = lobby.size()
  player.name = `Player ${lobby.size() + 1}`

  socket.player = player // eslint-disable-line no-param-reassign
  lobby.join(socket)
  lobby.whisper(player.id, 'id', player.id)

  console.log(`${player.name} has joined from ${socket.address().address}`)

  carrier.carry(socket, function (message) {
    console.log(`[${player.name}] ${message}`)
    interpret(message, player, game, lobby)
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
