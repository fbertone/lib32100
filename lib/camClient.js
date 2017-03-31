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
  // let idToSend = utils.uid564toBuffer(uid)
  utils.sendMessage(socket, address, commands.checkCam, utils.uid564toBuffer(uid))
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

const checkCredentials = function checkCredentials (socket, address, seq, creds) {
  let url = `/check_user.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const sendGet = function sendGet (socket, address, seq, url) {
  let urlBuf = Buffer.from(url)
  let payloadHead = Buffer.from([0xd1, 0x00, Math.floor(seq / 256), seq % 256, 0x01, 0x0a, 0x00, Math.floor((url.length + 4) / 256), (url.length + 4) % 256, 0x00, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20])
  let payload = Buffer.concat([payloadHead, urlBuf])

  utils.sendMessage(socket, address, commands.get, payload)
}

const sendMultipleGet = function sendMultipleGet (socket, address, seq, urls) {
  let payload = Buffer.from([0xd1, 0x00, Math.floor(seq / 256), seq % 256])
  urls.forEach((url) => {
    payload = Buffer.concat([payload, Buffer.from([0x01, 0x0a, 0x00, Math.floor((url.length + 4) / 256), (url.length + 4) % 256, 0x00, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20]), Buffer.from(url)])
  })
  utils.sendMessage(socket, address, commands.get, payload)
}

const parseMessage = function parseMessage (msg, cb) {
  let header = Buffer.allocUnsafe(2)
  msg.copy(header, 0, 0, 2)

  if (header.equals(responseHeaders.ping)) {
    return cb('pingpong', {subtype: 'ping'})
  } else if (header.equals(responseHeaders.pong)) {
    return cb('pingpong', {subtype: 'pong'})
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

module.exports.openSession = openSession
module.exports.sendPing = sendPing
module.exports.sendPong = sendPong
module.exports.closeSession = closeSession
module.exports.parseMessage = parseMessage
module.exports.sendGet = sendGet
module.exports.checkCredentials = checkCredentials
module.exports.sendMultipleGet = sendMultipleGet
