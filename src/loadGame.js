/**
 * Attemps to load classes needed to play the poker variant called `game`.
 * Returns an object of Game, Reporter, validate.
 * @param  {string} game
 * @return {object}
 */
function loadGame(game) {
  const classes = {}

  try {
    classes.Game = require(`./games/${game}/game`)
    classes.Reporter = require(`./games/${game}/reporter`)
    classes.mutate = require(`./games/${game}/mutate`)
  }
  catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error(`Game '${game}' doesn't exist.`)
      process.exit(1)
    }
    else {
      throw e
    }
  }

  return classes
}

module.exports = loadGame
