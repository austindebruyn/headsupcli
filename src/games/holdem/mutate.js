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
    game.state.results = rank(game)
  }
}

/**
 * Mutate the game state based on the action.
 * @param  {Game} game
 * @param  {any}  playerId
 * @param  {string} action
 * @return {void}
 */
function mutate(game, playerId, action) {
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
    game.state.pot = {}

    return newHand(game)
  }
  if (action === 'check') {
    const difference = game.state.pot[opponent.id] - game.state.pot[player.id]
    if (difference > 0 && player.balance > 0) {
      throw new GameMutationError(`You can't check here. Opponent has bet ${difference} to call.`)
    }

    if (game.state.pot[0] === game.state.pot[1] && game.state.activePlayer === game.state.dealer) {
      return nextStage(game)
    }
    game.state.activePlayer = opposite(game.state.activePlayer)
  }
  if (action === 'ack') {
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
    const difference = game.state.pot[opponent.id] - game.state.pot[player.id]

    if (difference <= 0) {
      throw new GameMutationError(`There's nothing to call.`)
    }
    if (player.balance <= difference) {
      throw new GameMutationError(`You don't have enough to call.`)
    }
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
