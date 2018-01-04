const _ = require('lodash')
const rightPad = require('pad-right')
const clear = require('clear')
require('colors')

function colorCard(card) {
  const suit = { d: '♦', s: '♠', h: '♥', c: '♣' }[card[1]]
  const color = 'dh'.includes(card[1]) ? 'red' : 'gray'

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
    const isThemButton = them.id === game.state.dealer ? '(BTN)' : '     ';
    console.log(`${isThemButton}${rightPad(them.name, 8, '.').cyan} $${them.balance.toString().green}`)

    // build their hand
    if (them.hand) {
      if (game.state.results) {
        const card1 = them.hand[0]
        const card2 = them.hand[1]
        console.log(`        ${colorCard(card1)} ${colorCard(card2)}       `)
      }
      else {
        console.log(`        🂠? 🂠?       `)
      }
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

    const isYouButton = you.id === game.state.dealer ? '(BTN)' : '     ';
    console.log(`${isYouButton}${rightPad(you.name, 8, '.').cyan} $${you.balance.toString().green}`)
    console.log('----------------------------'.yellow)
    console.log(` You have put $${game.getTotalForPlayer(you.id)} into this pot.`)
    if (game.state.activePlayer === you.id && game.state.lastAction) {
      switch (game.state.lastAction) {
        case 'check':
          console.log(` ${them.name} checks `)
          break
        case 'raise':
          console.log(` ${them.name} raises $${game.state.pot.hot[them.id]} `)
          break
        case 'call':
          console.log(` ${them.name} calls $${game.state.pot.hot[you.id]} `)
          break
      }
    }
    console.log('----------------------------'.yellow)

    // results
    if (game.state.results) {
      if (game.state.results.tie) {
        console.log(you.name + ': ' + _.find(game.state.results.tie, { id: you.id }))
        console.log(them.name + ': ' + _.find(game.state.results.tie, { id: them.id }))
      }
      else {
        if (game.state.results.winner.id === you.id) {
          console.log(`YOU WON THE HAND! TAKE THE POT $${game.getTotal().toString().green}`)
          console.log(`${you.name}: ${game.state.results.winner.description}`)
          console.log(`${them.name}: ${game.state.results.loser.description}`)
        }
        else {
          console.log(`You lost. ${them.name} took $${game.getTotal().toString().red}`)
          console.log(`${them.name}: ${game.state.results.winner.description}`)
          console.log(`${you.name}: ${game.state.results.loser.description}`)
        }
      }
    }

    console.log('\n')
  }
}

module.exports = Reporter
