const net = require('net')
const program = require('commander')
const carrier = require('carrier')
const interpret = require('./src/client/interpret')
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
    console.log(`[SERVER] ${line}`.cyan)
    interpret(line, game, connection)
  })
})

socket.on('close', function () {
  console.log('closed')
})
