class GameMutationError extends Error {
  constructor(...args) {
    super(...args)
    this.name = 'GameMutationError'
    Error.captureStackTrace(this, GameMutationError)
  }
}

module.exports = GameMutationError
