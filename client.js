
const program = require('commander')
require('colors')
const prompt = require('prompt')

program
  .version('0.1.0')
  .option('-n, --name [name]', 'Players name')
  .parse(process.argv)

let gameStarted = false
let STATE = null

function getAction() {
  if (STATE.activePlayer === program.name) {
    return {
      message: '[C]all, [r]aise, [f]old?'
    }
  }
  return null
}

console.log('hello ' + program.name.red)

const net = require('net')

var client = new net.Socket();
client.connect(23456, '127.0.0.1', function () {
	console.log('WE IN');
  client.write(`setname ${program.name}`)
});

client.on('data', function(data) {
	console.log(`[SERVER] ${data.toString()}`.cyan);
  let message = data.toString().trim()
  message = message.match(/^(\w*)(\s.*)?$/)

  switch (message[1].trim()) {
    case 'begin':
      gameStarted = true
      console.log('game is started! :tada:')
      break
    case 'setstate':
      console.log('I got a setstate!')
      const jsonString = message[2].trim().match(/^'(.*)'$/)[1]
      STATE = JSON.parse(jsonString)

      const action = getAction()
      if (action) {
        console.log(action.message.red)
        prompt.start()
        prompt.get(['action'], function (err, result) {
          if (err) throw err

          client.write(`act ${result.action}`)
        })
      }
      else {
        console.log('Waiting for other player...')
      }
      break
    default:
      console.log(`bad message '${message[1]}' from server`)
      break
  }
});

client.on('close', function() {
	console.log('closed');
});
