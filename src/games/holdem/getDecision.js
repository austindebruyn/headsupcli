module.exports = getDecision

/**
 * Returns the next decision the player needs to make.
 * This is an object with a key and a message to prompt.
 * Returns null if no action needed (player is out-of-turn).
 * @param  {Game} game
 * @param  {any} playerId
 * @return {Object|null}
 */
function getDecision(game, playerId) {
  if (game.state.results) {
    if (!game.state.players[playerId].acknowledged) {
      return {
        message: 'Ready for next hand?',
        options: [
          { name: 'Yes', value: 'ack' }
        ]
      };
    }
    return null;
  }
  else if (game.state.activePlayer === playerId) {
    let options = [];

    // preflop
    if (!game.state.board.flop) {
      switch (game.state.lastAction) {
        case null:
        case 'raise':
          options = [
            { name: 'Call', value: 'call' },
            { name: 'Raise', value: 'raise' },
            { name: 'Fold', value: 'fold' },
          ]
          break
        case 'call':
          options = [
            { name: 'Check', value: 'check' },
            { name: 'Raise', value: 'raise' },
            { name: 'Fold', value: 'fold' },
          ]
          break
      }
    }
    // postflop
    else {
      switch (game.state.lastAction) {
        case null:
        case 'check':
          options = [
            { name: 'Check', value: 'check' },
            { name: 'Raise', value: 'raise' },
            { name: 'Fold', value: 'fold' },
          ]
          break
        case 'raise':
          options = [
            { name: 'Call', value: 'call' },
            { name: 'Raise', value: 'raise' },
            { name: 'Fold', value: 'fold' },
          ]
          break
      }
    }

    return {
      message: 'What to do?',
      options,
    }
  }
  // if (game.state.activePlayer === playerId) {
  //   if (game.state.dealer !== playerId) {
  //     // Preflop dealer can check call or raise
  //     return {
  //       message: "You're the big blind. What to do?",
  //       options: [
  //         { name: 'Check', value: 'check' },
  //         { name: 'Call', value: 'call' },
  //         { name: 'Raise', value: 'raise' },
  //         { name: 'Fold', value: 'fold' },
  //       ],
  //     }
  //   } else {
  //     // Preflop non-dealer can call or raise
  //
  //   }
  // }
  return null
}
