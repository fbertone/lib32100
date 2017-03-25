const utils = require('./utils')

const responseHeaders = {
  end: Buffer.from([0xF1, 0xF0]),
  pong: Buffer.from([0xF1, 0xE1]),
  ping: Buffer.from([0xF1, 0xE0]),
  camId: Buffer.from([0xF1, 0x42]),
  ack: Buffer.from([0xF1, 0xD1]),
  http: Buffer.from([0xF1, 0xD0])
}

const commands = {
  ping: Buffer.from([0xF1, 0xE0]),
  pong: Buffer.from([0xF1, 0xE1]),
  checkCam: Buffer.from([0xF1, 0x41]),
  get: Buffer.from([0xF1, 0xD0]),
  ack: Buffer.from([0xF1, 0xD1]),
  end: Buffer.from([0xF1, 0xF0])
}

const openSession = function openSession (socket, address, uid) {
  let idToSend = utils.uid564toBuffer(uid)
  utils.sendMessage(socket, address, commands.checkCam, idToSend)
}

const sendPing = function sendPing (socket, address) {
  utils.sendMessage(socket, address, commands.ping, null)
}

const sendPong = function sendPong (socket, address) {
  utils.sendMessage(socket, address, commands.pong, null)
}

const closeSession = function closeSession (socket, address) {
  utils.sendMessage(socket, address, commands.end, null)
}

const parseMessage = function parseMessage (msg, cb) {
  let header = Buffer.allocUnsafe(2)
  msg.copy(header, 0, 0, 2)

  if (header.equals(responseHeaders.ping)) {
    return cb('pingpong', {})
  } else if (header.equals(responseHeaders.pong)) {
    return cb('pingpong', {})
  } else if (header.equals(responseHeaders.end)) {
    return cb('close', {})
  } else if (header.equals(responseHeaders.camId)) {
    // TODO parse ID
    return cb('confirmed', {})
  } else if (header.equals(responseHeaders.ack)) {
    return cb('ack', {})
  } else if (header.equals(responseHeaders.http)) {
    return cb('http', {})
  } else {
    return cb('unknownMsg', {header: 'unknown', hex: msg.toString('hex')})
  }
}

module.exports.parseMessage = openSession
module.exports.parseMessage = sendPing
module.exports.parseMessage = sendPong
module.exports.parseMessage = closeSession
module.exports.parseMessage = parseMessage
