const net = require('net')
require('colors')

const STATE = {
  dealer: null,
  activePlayer: null,
  board: {
    flop: [ 1, 2, 3 ]
  },
  pot: 0,
  bb: 1,
  players: []
}

function startGame() {
  STATE.dealer = players[0].playerName
  STATE.activePlayer = players[0].playerName
  STATE.players.push({
    name: players[0].playerName,
    balance: STATE.bb * 100,
    hand: [6, 7]
  })
  STATE.players.push({
    name: players[1].playerName,
    balance: STATE.bb * 100,
    hand: [8, 9]
  })
}

const players = []

function broadcast(message) {
  console.log(`Broadcasting... (${message})`.purple)
  players.forEach(function (socket) {
    socket.write(message)
  })
}
function broadcastState() {
  broadcast(`setstate '${JSON.stringify(STATE)}'\r\n`)
}

const server = net.createServer(function (socket) {
  if (players.length === 2) {
    socket.write('threes a crowd buddy. get a move on')
    return socket.close()
  }

  players.push(socket)

  if (players.length === 2) {
    broadcast('begin\r\n')
    console.log('Game is beginning...')
    startGame()
    broadcastState()
  }

  socket.on('data', function (data) {
    let message = data.toString().trim()
    message = message.split(' ')

    switch (message[0]) {
      case 'setname':
        socket.playerName = message[1]
        console.log(`[${socket.playerName}] ${data.toString()}`.yellow)
        break
      case 'act':
        const action = message[1].trim()

        STATE.activePlayer = players[1].playerName
        STATE.pot += STATE.bb
        STATE.players[0].balance -= STATE.bb
        broadcastState()
        break
      default:
        console.log(`BAD MESSAGE [${socket.playerName}] ${data.toString()}`.red)
    }
  })
})

server.listen(23456, '127.0.0.1')
