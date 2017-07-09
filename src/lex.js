const assert = require('assert')

module.exports = lex

function lex(input) {
  const lexer = new Lexer()

  return lexer.rule('trim whitespace', /^(\s+)/, () => null)
    .rule('numbers', /^(\d+)/, i => parseInt(i, 10))
    .rule('characters', /^(\w+)/, i => i)
    .rule('double quoted string', /^"([\w\s\[\]SHCD,:'{}]+)"/, i => jsonOrString(i))
    .rule('single quoted string', /^'([\w\s\[\]SHCD,:"{}]+)'/, i => jsonOrString(i))
    .run(input)
}

class Lexer {
  constructor() {
    this.rules = []
  }

  rule(name, rx, callback) {
    this.rules.push({ name, rx, callback })
    return this
  }

  run(string) {
    let result = []
    let dissected = string

    while (dissected.length > 0) {
      let i
      for (i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i]
        const match = dissected.match(rule.rx)
        if (match) {
          assert(match[1], `lexer rule '${rule.name}' regex does not have a capture group`)
          assert(match[1].length > 0, `lexer rule '${rule.name}' captured an empty group`)

          dissected = dissected.slice(match[0].length)

          const tokens = rule.callback(match[1])
          if (tokens != null) {
            result = result.concat(tokens)
          }
          break
        }
      }

      assert(i !== this.rules.length, `lexer rules were not complete for string '${dissected}'`)
    }

    return result
  }
}

function jsonOrString(message) {
  return message.match(/^{.*}$/) ? JSON.parse(message) : message
}
