const net = require('net')
const program = require('commander')
const carrier = require('carrier')
const prompt = require('prompt')
const lex = require('./src/lex')
const Interpreter = require('./src/interpreter')
const Game = require('./src/game')
const Connection = require('./src/client/connection')
require('colors')

program
  .version('0.1.0')
  .option('-n, --name [name]', 'Player\'s name')
  .parse(process.argv)

if (typeof program.name !== 'string') {
  program.outputHelp()
  process.exit(1)
}

const socket = new net.Socket()

socket.connect(23456, '127.0.0.1', function () {
  const connection = new Connection(socket)
  const game = new Game()

  connection.send('setname', program.name)

  carrier.carry(socket, function (line) {
    const tokens = lex(line)
    const interpreter = new Interpreter()

    console.log(`[SERVER] ${line}`.cyan)

    interpreter.rule('noroom', function () {
      console.log('Server kicked us out. no room')
      process.exit(0)
    })
    .rule('begin', function () {
      console.log('game is started!')
    })
    .rule('id', function (id) {
      connection.id = id
    })
    .rule('hydrate', function (state) {
      game.hydrate(state)
      const action = game.getAction(connection.id)

      if (action) {
        console.log(action.message.red)
        prompt.start()
        prompt.get(['action'], function (err, result) {
          if (err) throw err
          connection.send('act', result.action)
        })
      } else {
        console.log('Waiting for other player...')
      }
    })

    if (!interpreter.go(tokens)) {
      console.log(`bad message '${tokens[0]}' from server`)
    }
  })
})

socket.on('close', function () {
  console.log('closed')
})
