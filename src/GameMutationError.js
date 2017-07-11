class GameMutationError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, GameMutationError)
  }
}

module.exports = GameMutationError
