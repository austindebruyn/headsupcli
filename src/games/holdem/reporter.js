const _ = require('lodash')
const rightPad = require('pad-right')
const clear = require('clear')
require('colors')

function colorCard(card) {
  const suit = { D: '♦', S: '♠', H: '♥', C: '♣' }[card[1]]
  const color = 'DH'.includes(card[1]) ? 'red' : 'gray'

  return `${card[0]}${suit}`[color]
}

class Reporter {
  state(game, id) {
    clear()

    const emptyLine = `                            `;

    const you = game.getPlayer(id)
    const them = game.getOpponent(id)
    console.log('----------------------------'.yellow)
    console.log(`Hand №${game.state.hand + 1}`.yellow)
    console.log('----------------------------'.yellow)
    console.log(`${rightPad(them.name, 8, '.').cyan} $${them.balance.toString().green}`)

    // build their hand
    if (them.hand) {
      console.log(`        🂠? 🂠?       `)
    } else {
      console.log('                      ')
    }

    // community
    console.log(emptyLine)
    if (game.state.board.flop) {
      let str = '  ';
      game.state.board.flop.forEach(function (c) {
        str += `${colorCard(c)} `
      })
      if (game.state.board.turn) str += `${colorCard(game.state.board.turn)} `
      if (game.state.board.river) str += `${colorCard(game.state.board.river)} `
      console.log(str)
    } else {
      console.log(emptyLine)
    }
    console.log(` $${game.getTotal().toString().yellow} in the pot`)

    // build your hand
    if (you.hand) {
      const card1 = you.hand[0]
      const card2 = you.hand[1]
      console.log(`        ${colorCard(card1)} ${colorCard(card2)}       `)
    } else {
      console.log(emptyLine)
    }

    console.log(`${rightPad(you.name, 8, '.').cyan} $${you.balance.toString().green}`)
    console.log('----------------------------'.yellow)
    console.log(` You have put $${game.getTotalForPlayer(you.id)} into this pot.`)
    console.log('----------------------------'.yellow)
    console.log('\n')
  }
}

module.exports = Reporter
