const _ = require('lodash')

/**
 * Shortcut utility to fold down any number of arguments into a single string
 * separated by spaces. Objects and arrays are serialized.
 * @param  {any} args
 * @return {String}
 */
function buildMessage(...args) {
  return _(args)
    .map(tokenify)
    .flattenDeep()
    .join(' ')

  function tokenify(value) {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (Array.isArray(value)) return value.map(tokenify)
    return `'${JSON.stringify(value)}'`
  }
}

module.exports = buildMessage
