const lex = require('../lex')
const prompt = require('prompt')
const Interpreter = require('../interpreter')

module.exports = function interpret(message, game, connection) {
  const tokens = lex(message)
  const interpreter = new Interpreter()

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
}
