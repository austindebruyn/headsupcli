const _ = require('lodash')

class Game {
  constructor() {
    this.state = {
      dealer: null,
      activePlayer: null,
      board: {
        flop: [1, 2, 3],
      },
      pot: 0,
      bb: 1,
      players: [],
    }
  }

  getAction(id) {
    if (this.state.activePlayer === id) {
      return {
        message: '[C]all, [r]aise, [f]old?',
      }
    }
    return null
  }

  validateAction(action) {
    
  }

  start() {
    this.state.dealer = 0
    this.state.activePlayer = 0
    this.state.players.push({
      id: 0,
      balance: this.state.bb * 100,
      hand: [6, 7],
    })
    this.state.players.push({
      id: 1,
      balance: this.state.bb * 100,
      hand: [8, 9],
    })
  }

  hydrate(state = {}) {
    _.merge(this.state, state)
  }
}

module.exports = Game
