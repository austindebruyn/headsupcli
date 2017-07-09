const _ = require('lodash')

module.exports = mutate

function randomCard() {
  const rank = _.sample(['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'])
  const suit = _.sample(['H', 'D', 'C', 'S'])

  return `${rank}${suit}`
}

function opposite(id) {
  return id === 0 ? 1 : 0
}

function newHand(game) {
  game.state.hand += 1

  game.state.dealer = opposite(game.state.dealer)
  game.state.activePlayer = game.state.dealer

  game.state.pot[game.state.dealer] = game.state.sb
  game.state.pot[opposite(game.state.dealer)] = game.state.bb

  game.state.players[game.state.dealer].balance -= game.state.sb
  game.state.players[opposite(game.state.dealer)].balance -= game.state.bb

  game.state.players[game.state.dealer].hand = [randomCard(), randomCard()]
  game.state.players[opposite(game.state.dealer)].hand = [randomCard(), randomCard()]
}

function nextStage(game) {
  if (!game.state.board.flop) {
    game.state.board.flop = [randomCard(), randomCard(), randomCard()]
    game.state.activePlayer = opposite(game.state.dealer)
  } else if (!game.state.board.turn) {
    game.state.board.turn = randomCard()
  } else if (!game.state.board.river) {
    game.state.board.river = randomCard()
  } else {
    // end hand - compare!
  }
}

/**
 * Mutate the game state based on the action.
 * @param  {Game} game
 * @param  {object} action
 * @return {void}
 */
function mutate(game, action, argument=null) {
  const player = game.getPlayer(game.state.activePlayer)
  const opponent = game.getOpponent(game.state.activePlayer)

  if (action === 'start') {
    newHand(game)
  }
  if (action === 'fold') {
    opponent.balance += game.getTotal()
    game.state.pot = {}

    return newHand(game)
  }
  if (action === 'check') {
    if (game.state.pot[0] === game.state.pot[1] && game.state.activePlayer === game.state.dealer) {
      return nextStage(game)
    }
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'call') {
    const difference = game.state.pot[opposite(player.id)] - game.state.pot[player.id]
    game.state.pot[player.id] += difference
    player.balance -= difference
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'raise') {
    game.state.pot[player.id] += 6
    player.balance -= 6
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
}
