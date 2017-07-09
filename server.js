const lex = require('./src/lex')
const net = require('net')
const carrier = require('carrier')
const program = require('commander')
const loadGame = require('./src/loadGame')
const Lobby = require('./src/server/lobby')
const Interpreter = require('./src/interpreter')
require('colors')

program
  .version('0.1.0')
  .option('-g, --game [name]', 'Game to play. Default is `holdem.`')
  .parse(process.argv)

const { Game, Reporter, validate } = loadGame(program.game || 'holdem')

const game = new Game()
const lobby = new Lobby()

const server = net.createServer(function (socket) {
  if (lobby.size() === 2) {
    lobby.reject(socket)
    return
  }

  const player = lobby.join(socket)
  lobby.whisper(player.id, 'id', player.id)

  game.addPlayer(player.id, player.name, game.state.bb * 100)

  console.log(`${player.name} has joined from ${socket.address().address}`)

  carrier.carry(socket, function (message) {
    const tokens = lex(message)
    const interpreter = new Interpreter()

    console.log(`[${player.name}] ${message}`)

    interpreter.rule('act', function (action, ...args) {
      game.mutate(action, ...args)
      lobby.broadcast('hydrate', game.state)
    })
    .rule('setname', function (name) {
      player.name = name.slice(0, 8)
      game.setPlayerName(player.id, player.name)
    })

    if (!interpreter.go(tokens)) {
      console.log(`bad message '${tokens[0]}' from client`)
    }
  })

  if (lobby.size() === 2) {
    console.log('Starting in 300ms...')
    setTimeout(function () {
      game.start()
      lobby.broadcast('begin')
      lobby.broadcast('hydrate', game.state)
    }, 300);
  }
})

server.listen(23456, '127.0.0.1', function () {
  console.log('Server listening on 127.0.0.1:23456')
})
