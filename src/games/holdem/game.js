const _ = require('lodash')
const getDecision = require('./getDecision')
const mutate = require('./mutate')

class Game {
  constructor() {
    this.state = {
      hand: -1,
      dealer: 1,
      activePlayer: null,
      board: {},
      pot: {},
      sb: 1,
      bb: 2,
      players: [],
    }
  }

  addPlayer(id, name, balance) {
    this.state.players.push({
      id: id,
      name: name,
      balance: balance,
      hand: null
    })
  }

  getPlayers() {
    return this.state.players
  }

  getPlayer(id) {
    return _.find(this.state.players, { id })
  }

  getOpponent(id) {
    return _(this.state.players)
      .without(this.getPlayer(id))
      .first()
  }

  getDecision(id) {
    return getDecision(this, id)
  }

  getTotal() {
    return this.state.players.reduce((acc, p) => acc + (this.state.pot[p.id] || 0), 0)
  }

  getTotalForPlayer(id) {
    return this.state.pot[id]
  }

  mutate(action, ...args) {
    return mutate(this, action, ...args)
  }

  setPlayerName(id, name) {
    _.find(this.state.players, { id }).name = name
  }

  start() {
    mutate(this, 'start')
  }

  hydrate(state = {}) {
    _.merge(this.state, state)
  }
}

Game.game = 'holdem'

module.exports = Game
