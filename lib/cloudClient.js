const utils = require('./utils')

const commands = {
  stun: Buffer.from([0xF1, 0x00]),
  lookup: Buffer.from([0xF1, 0x20])
}

const responseHeaders = {
  stun: Buffer.from([0xF1, 0x01]),
  lookupRESP: Buffer.from([0xF1, 0x21]),
  lookupAddr: Buffer.from([0xF1, 0x40])
}

const sendSTUN = function (socket, address, cb) {
  utils.sendMessage(socket, address, commands.stun)
}

const lookupUid = function lookupUid (socket, address, uid, cb) {
  let payload
  // TODO better discrimination of UIDs types
  let newUid = utils.uidToBuffer(uid)
  if (uid) {
    // let's send a STUN just to be sure that the socket is initialized
    utils.sendMessage(socket, address, commands.stun, null, () => {
      payload = Buffer.concat([newUid, Buffer.from([0x00, 0x00, Math.floor(socket.address().port / 256), socket.address().port % 256, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])])
      utils.sendMessage(socket, address, commands.lookup, payload)
      return cb()
    })
  } else {
    return cb({error: 'Unknown UID format'})
  }
}

const parseMessage = function parseMessage (msg, cb) {
  let header = Buffer.allocUnsafe(2)
  msg.copy(header, 0, 0, 2)

  if (header.equals(responseHeaders.stun)) {
    let port = msg[7] * 256 + msg[6]
    let ip = msg[11] + '.' + msg[10] + '.' + msg[9] + '.' + msg[8]
    return cb('stun', {address: {host: ip, port: port}, raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.lookupRESP)) {
    if (msg.equals(Buffer.from([0xF1, 0x21, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00]))) {
      return cb('lookupACK', {raw: msg.toString('hex')})
      // TODO check what is cod 0xFD (invalid format? unknown?)
    } else if (msg.equals(Buffer.from([0xF1, 0x21, 0x00, 0x04, 0xFE, 0x00, 0x00, 0x00]))) {
      return cb('lookup', {isValid: true, isOnline: false, raw: msg.toString('hex')})
    } else if (msg.equals(Buffer.from([0xF1, 0x21, 0x00, 0x04, 0xFF, 0x00, 0x00, 0x00]))) {
      return cb('lookup', {isValid: false, isOnline: false, raw: msg.toString('hex')})
    } else {
      return cb('unknownMsg', {header: 'lookup', raw: msg.toString('hex')})
    }
  } else if (header.equals(responseHeaders.lookupAddr)) {
    // logger.log('info', 'lookupAddr')
    let port = msg[7] * 256 + msg[6]
    let ip = msg[11] + '.' + msg[10] + '.' + msg[9] + '.' + msg[8]
    return cb('lookup', {address: {host: ip, port: port}, raw: msg.toString('hex')})
  } else {
    return cb('unknownMsg', {header: 'unknown', raw: msg.toString('hex')})
  }
}

module.exports.sendSTUN = sendSTUN
module.exports.lookupUid = lookupUid
module.exports.parseMessage = parseMessage
