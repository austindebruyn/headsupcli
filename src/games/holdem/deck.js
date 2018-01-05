class Deck {
  constructor() {
    const cards = []

    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K']
    const suits = ['h', 'd', 'c', 's']

    ranks.forEach(rank => {
      suits.forEach(suit => {
        cards.push(`${rank}${suit}`)
      })
    })

    this.cards = cards
    this.shuffle()
  }

  shuffle() {
    // Fisher-Yates
    for (let i = 0; i < this.cards.length - 2; i++) {
      const idx = Math.floor(Math.random()*this.cards.length)
      const tmp = this.cards[idx]
      this.cards[idx] = this.cards[i]
      this.cards[i] = tmp
    }
  }

  deal(n = 1) {
    return n === 1
      ? this.cards.splice(0, n).pop()
      : this.cards.splice(0, n)
  }
}

module.exports = Deck
