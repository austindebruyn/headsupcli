const lex = require('../lex')
const Interpreter = require('../interpreter')

module.exports = function interpret(message, player, game, lobby) {
  const tokens = lex(message)
  const interpreter = new Interpreter()

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
    console.log(`bad message '${tokens[0]}' from server`)
  }
}
