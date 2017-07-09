class Interpreter {
  constructor() {
    this.rules = {}
  }

  rule(token, handler) {
    this.rules[token] = handler
    return this
  }

  go([token, ...args]) {
    if (typeof this.rules[token] !== 'function') {
      return false
    }

    this.rules[token](...args)
    return true
  }
}

module.exports = Interpreter
