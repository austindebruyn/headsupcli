const _ = require('lodash')
const GameMutationError = require('../../GameMutationError')
const handranker = require('handranker')

module.exports = mutate

function randomCard() {
  const rank = _.sample(['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'])
  const suit = _.sample(['h', 'd', 'c', 's'])

  return `${rank}${suit}`
}

function rank(game) {
  if (!game.state.board.flop || !game.state.board.turn || !game.state.board.river) {
    throw new GameMutationError("Can't rank the board yet - river isn't dealt.")
  }
  const hands = []
  game.state.players.forEach(function (player) {
    hands.push({ id: player.id, cards: player.hand })
  })
  const board = [].concat(game.state.board.flop)
  board.push(game.state.board.turn)
  board.push(game.state.board.river)

  console.log(hands)
  console.log(board)
  const results = handranker.orderHands(hands, board)
  console.log(results)

  if (!Array.isArray(results)) {
    throw new GameMutationError(`Ranker returned '${results}'`)
  }
  if (results[0].length === 2) {
    return { tie: {
      [results[0][0].id]: results[0][0].description,
      [results[0][1].id]: results[0][1].description,
    }};
  }
  return {
    winner: {
      id: results[0][0].id,
      description: results[0][0].description,
    },
    loser: {
      id: results[1][0].id,
      description: results[1][0].description,
    },
  }
}

function opposite(id) {
  return id === 0 ? 1 : 0
}

function newHand(game) {
  game.state.hand += 1

  game.state.results = null
  game.state.board = { flop: null, river: null, turn: null }

  game.state.dealer = opposite(game.state.dealer)
  game.state.activePlayer = game.state.dealer

  game.clearPot()
  game.state.pot.hot[game.state.dealer] = game.state.sb
  game.state.pot.hot[opposite(game.state.dealer)] = game.state.bb
  game.state.pot.cold[game.state.dealer] = 0
  game.state.pot.cold[opposite(game.state.dealer)] = 0

  game.state.players[game.state.dealer].balance -= game.state.sb
  game.state.players[opposite(game.state.dealer)].balance -= game.state.bb

  game.state.players[game.state.dealer].hand = [randomCard(), randomCard()]
  game.state.players[opposite(game.state.dealer)].hand = [randomCard(), randomCard()]
}

function nextStage(game) {
  game.state.pot.cold[game.state.dealer] += game.state.pot.hot[game.state.dealer]
  game.state.pot.hot[game.state.dealer] = 0
  game.state.pot.cold[opposite(game.state.dealer)] += game.state.pot.hot[opposite(game.state.dealer)]
  game.state.pot.hot[opposite(game.state.dealer)] = 0

  if (!game.state.board.flop) {
    game.state.board.flop = [randomCard(), randomCard(), randomCard()]
    game.state.activePlayer = game.state.dealer
  } else if (!game.state.board.turn) {
    game.state.board.turn = randomCard()
  } else if (!game.state.board.river) {
    game.state.board.river = randomCard()
  } else {
    game.state.results = rank(game)
  }
}

/**
 * Mutate the game state based on the action.
 * @param  {Game} game
 * @param  {any}  playerId
 * @param  {string} action
 * @param  {any} argument
 * @return {void}
 */
function mutate(game, playerId, action, argument) {
  const player = game.getPlayer(playerId)
  const opponent = game.getOpponent(playerId)

  if (action === 'start') {
    if (game.state.hand >= 0) {
      throw new GameMutationError('Game has already started.')
    }
    newHand(game)
  }
  if (action === 'fold') {
    opponent.balance += game.getTotal()

    return newHand(game)
  }
  if (action === 'check') {
    const difference = game.state.pot.hot[opponent.id] - game.state.pot.hot[player.id]
    if (difference > 0 && player.balance > 0) {
      throw new GameMutationError(`You can't check here. Opponent has bet ${difference} to call.`)
    }

    if (game.state.pot[0] === game.state.pot[1] && game.state.activePlayer === game.state.dealer) {
      return nextStage(game)
    }
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'ack') {
    if (!game.state.results) {
      throw new GameMutationError('Bad time to ack.')
    }
    game.state.players[player.id].acknowledged = true

    if (game.state.players[opponent.id].acknowledged) {
      const pot = game.getTotal()
      if (game.state.results.tie) {
        game.state.players[player.id].balance += pot/2
        game.state.players[opponent.id].balance += pot/2
      } else {
        game.state.players[game.state.results.winner.id].balance += pot
      }
      return newHand(game)
    }
  }
  if (action === 'call') {
    const difference = game.state.pot.hot[opponent.id] - game.state.pot.hot[player.id]

    if (difference <= 0) {
      throw new GameMutationError(`There's nothing to call.`)
    }
    if (player.balance <= difference) {
      throw new GameMutationError(`You don't have enough to call.`)
    }
    game.state.pot.hot[player.id] += difference
    player.balance -= difference
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'raise') {
    const raiseAmount = parseInt(argument, 10)
    if (isNaN(raiseAmount)) {
      throw new GameMutationError(`The amount to raise must be a number.`)
    }
    if (raiseAmount < game.state.bb) {
      throw new GameMutationError(`Raise must be at least one big blind ($${game.state.bb}).`)
    }
    if (raiseAmount < game.state.pot.hot[opponent.id] * 2) {
      throw new GameMutationError(`Your opponent bet $${game.state.pot.hot[opponent.id]}. You must at least double this.`)
    }

    const difference = raiseAmount - game.state.pot.hot[player.id]

    if (difference > player.balance) {
      throw new GameMutationError(`You're about to go all-in.`)
    }

    game.state.pot.hot[player.id] += difference
    player.balance -= difference
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'allin') {
    if (player.balance === 0) {
      throw new GameMutationError(`You've already gone all-in.`)
    }
    game.state.pot.hot[player.id] += player.balance
    player.balance = 0
  }
}
