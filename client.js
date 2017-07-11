const net = require('net')
const program = require('commander')
const carrier = require('carrier')
const loadGame = require('./src/loadGame')
const lex = require('./src/lex')
const inquirer = require('inquirer')
const Interpreter = require('./src/interpreter')
const Connection = require('./src/client/connection')
require('colors')

program
  .version('0.1.0')
  .option('-n, --name [name]', 'Player\'s name')
  .option('-g, --game [name]', 'Game to play. Default is `holdem.`')
  .parse(process.argv)

if (typeof program.name !== 'string') {
  program.outputHelp()
  process.exit(1)
}

const { Game, Reporter, validate } = loadGame(program.game || 'holdem')

const socket = new net.Socket()

socket.connect(23456, '127.0.0.1', function () {
  const connection = new Connection(socket)
  const game = new Game()
  const reporter = new Reporter()

  connection.send('setname', program.name)

  function prompt(decision) {
    inquirer.prompt([{
      type: 'list',
      name: 'decision',
      message: decision.message,
      choices: decision.options,
    }]).then(function ({ decision }) {
      connection.send('act', decision)
    })
    .catch(function (err) {
      console.error(err)
      process.exit(1)
    })
  }

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
    .rule('fatal', function (message) {
      reporter.state(game, connection.id)
      console.log(`[SERVER] @you: ${message.red}`)

      const decision = game.getDecision(connection.id)
      if (decision) {
        prompt(decision)
      }
    })
    .rule('hydrate', function (state) { console.log('got  HYDRA')
      game.hydrate(state)

      reporter.state(game, connection.id)

      const decision = game.getDecision(connection.id)

      if (decision) {
        prompt(decision)
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
