const expect = require('chai').expect
const lex = require('../src/lex')

describe('.lex', function () {
  describe('should parse', function () {
    it('strings', function () {
      expect(lex('hello matt damon')).to.eql(['hello', 'matt', 'damon'])
    })

    it('whitespace', function () {
      expect(lex(' hello  matt damon  ')).to.eql(['hello', 'matt', 'damon'])
      expect(lex('login\n\r\n')).to.eql(['login'])
      expect(lex('\n hello world \n')).to.eql(['hello', 'world'])
    })

    it('quotes', function () {
      expect(lex('"hello"')).to.eql(['hello'])
      expect(lex("hello 'matt damon'")).to.eql(['hello', 'matt damon'])
      expect(lex('hello "matt damon"')).to.eql(['hello', 'matt damon'])
      expect(lex('hello "53"')).to.eql(['hello', '53'])
    })

    it('numbers', function () {
      const tokens = lex('hello 53')

      expect(typeof tokens[1]).to.eql('number')
      expect(tokens[1]).to.eql(53)
    })

    it('json', function () {
      const tokens = lex('hello \'{"a": [1, 2, 3]}\'')

      expect(typeof tokens[1]).to.eql('object')
      expect(tokens).to.eql(['hello', { a: [1, 2, 3] }])
    })

    it('complicated string', function () {
      const tokens = lex('hello \'want to go all-in with $200 (that\'s a lot)?!\'')

      expect(typeof tokens[1]).to.eql('string')
      expect(tokens).to.eql(['hello', "want to go all-in with $200 (that's a lot)?!"])
    })
  })
})
