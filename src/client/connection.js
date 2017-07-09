const buildMessage = require('../buildMessage')

class Connection {
  constructor(socket) {
    this.socket = socket
    this.id = null
  }

  send(...args) {
    const text = buildMessage(args)
    this.socket.write(`${text}\n`)
  }
}

module.exports = Connection
