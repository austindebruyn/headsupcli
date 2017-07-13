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

  carrier.carry(socket, function (line) {
    let nextDecision = null
    const tokens = lex(line)
    const interpreter = new Interpreter()

    console.log(`[SERVER] ${line}`.cyan)

    function prompt(decision, currentPotAmount=0) {
      let raiseMessage = 'How much to raise the bet to?'
      if (currentPotAmount > 0) {
        raiseMessage += ` (You have already bet $${currentPotAmount} on this hand)`
      }
      inquirer.prompt([{
        type: 'list',
        name: 'decision',
        message: decision.message,
        choices: decision.options,
      }, {
        type: 'input',
        name: 'raise',
        message: raiseMessage,
        when: ({ decision }) => decision === 'raise'
      }]).then(function ({ decision, raise }) {
        nextDecision = null
        if (decision === 'raise') {
          return connection.send('act', decision, raise)
        }
        connection.send('act', decision)
      })
      .catch(function (err) {
        console.error(err)
        process.exit(1)
      })
    }

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
        prompt(decision, game.state.pot.hot[connection.id])
      }
    })
    .rule('hydrate', function (state) {
      game.hydrate(state)

      if (!nextDecision) {
        reporter.state(game, connection.id)

        nextDecision = game.getDecision(connection.id)

        if (nextDecision) {
          prompt(nextDecision)
        } else {
          nextDecision = null
          console.log('Waiting for other player...')
        }
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
