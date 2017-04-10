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
  let idToSend = utils.uidToBuffer(uid)
  if (idToSend) {
    utils.sendMessage(socket, address, commands.checkCam, idToSend)
  }
}

const sendAck = function sendAck (socket, address, acks) {
  if (acks && acks.length && acks.length > 0) {
    let payload = Buffer.from([0xD1, 0x00, Math.floor(acks.length / 256), acks.length % 256])
    acks.forEach((ack) => {
      payload = Buffer.concat([payload, Buffer.from([Math.floor(ack / 256), ack % 256])])
    })
    utils.sendMessage(socket, address, commands.ack, payload)
  }
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

const getCameraParameters = function getCameraParameters (socket, address, seq, creds) {
  let url = `/get_camera_parameters.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getParameters = function getParameters (socket, address, seq, creds) {
  let url = `/get_params.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getSnapshot = function getSnapshot (socket, address, seq, creds) {
  let url = `/snapshot.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getAudiostream = function getAudiostream (socket, address, seq, streamid, creds) {
  let url = `/audiostream.cgi?streamid=${streamid}&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getVideostream = function getVideostream (socket, address, seq, streamid, creds) {
  let url = `/livestream.cgi?streamid=${streamid}&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const sendGet = function sendGet (socket, address, seq, url) {
  let urlBuf = Buffer.from(url)
  let payloadHead = Buffer.from([0xd1, 0x00, Math.floor(seq / 256), seq % 256, 0x01, 0x0a, 0x00, Math.floor((url.length + 4) / 256), (url.length + 4) % 256, 0x00, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20])
  let payload = Buffer.concat([payloadHead, urlBuf])

  utils.sendMessage(socket, address, commands.get, payload)
}

const sendAuthenticatedGet = function sendAuthenticatedGet (socket, address, seq, unauthUrl, creds) {
  // TODO: check if url already contains the '?' to add parameters, in this case use '&'
  let url = `${unauthUrl}?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
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
    return cb('pingpong', {subtype: 'ping', raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.pong)) {
    return cb('pingpong', {subtype: 'pong', raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.end)) {
    return cb('close', {raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.camId)) {
    // TODO parse ID
    return cb('confirmed', {raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.ack)) {
    return cb('ack', {raw: msg.toString('hex')})
  } else if (header.equals(responseHeaders.http)) {
    // the first packet has a 16 bytes header, the following just the standard 8
    let seq = msg[6] * 256 + msg[7]
    let payload = Buffer.allocUnsafe(msg.length - 8)
    msg.copy(payload, 0, 8)
    return cb('http', {seq: seq, raw: msg.toString('hex'), payload: payload})
  } else {
    return cb('unknownMsg', {header: 'unknown', raw: msg.toString('hex')})
  }
}

const parseHttp = function parseHttp (msg, cb) {
  let header = Buffer.allocUnsafe(8)
  msg.copy(header, 0, 8, 16)
  let payload = Buffer.allocUnsafe(msg.length - 16)
  msg.copy(payload, 0, 16)
  let size = header[5] * 256 + header[4]
  cb({size: size, header: header, payload: payload})
}

module.exports.openSession = openSession
module.exports.sendPing = sendPing
module.exports.sendPong = sendPong
module.exports.closeSession = closeSession
module.exports.parseMessage = parseMessage
module.exports.sendGet = sendGet
module.exports.checkCredentials = checkCredentials
module.exports.sendMultipleGet = sendMultipleGet
module.exports.getParameters = getParameters
module.exports.getSnapshot = getSnapshot
module.exports.getAudiostream = getAudiostream
module.exports.getVideostream = getVideostream
module.exports.sendAuthenticatedGet = sendAuthenticatedGet
module.exports.getCameraParameters = getCameraParameters
module.exports.sendAck = sendAck
module.exports.parseHttp = parseHttp
