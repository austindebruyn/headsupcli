const _ = require('lodash')

module.exports = function buildMessage(...args) {
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
