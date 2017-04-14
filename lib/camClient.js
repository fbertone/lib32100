'use strict'
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
    utils.sendMessage(socket, address, commands.checkCam, idToSend)
    utils.sendMessage(socket, address, commands.checkCam, idToSend)
    utils.sendMessage(socket, address, commands.checkCam, idToSend)
  }
}

const sendHttpAck = function sendHttpAck (socket, address, acks) {
  if (acks && acks.length && acks.length > 0) {
    let payload = Buffer.from([0xD1, 0x00, Math.floor(acks.length / 256), acks.length % 256])
    acks.forEach((ack) => {
      payload = Buffer.concat([payload, Buffer.from([Math.floor(ack / 256), ack % 256])])
    })
    utils.sendMessage(socket, address, commands.ack, payload)
  }
}

const sendVideoAck = function sendVideoAck (socket, address, acks) {
  if (acks && acks.length && acks.length > 0) {
    let payload = Buffer.from([0xD1, 0x01, Math.floor(acks.length / 256), acks.length % 256])
    acks.forEach((ack) => {
      payload = Buffer.concat([payload, Buffer.from([Math.floor(ack / 256), ack % 256])])
    })
    utils.sendMessage(socket, address, commands.ack, payload)
  }
}

const sendAudioAck = function sendAudioAck (socket, address, acks) {
  if (acks && acks.length && acks.length > 0) {
    let payload = Buffer.from([0xD1, 0x02, Math.floor(acks.length / 256), acks.length % 256])
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

const getCameraParams = function getCameraParams (socket, address, seq, creds) {
  let url = `/get_camera_params.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getParams = function getParams (socket, address, seq, creds) {
  let url = `/get_params.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getFactoryParam = function getFactoryParam (socket, address, seq, creds) {
  let url = `/get_factory_param.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getStatus = function getStatus (socket, address, seq, creds) {
  let url = `/get_status.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getMisc = function getMisc (socket, address, seq, creds) {
  let url = `/get_misc.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getRtsp = function getRtsp (socket, address, seq, creds) {
  let url = `/get_rtsp.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getOnvif = function getOnvif (socket, address, seq, creds) {
  let url = `/get_onvif.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getRecord = function getRecord (socket, address, seq, creds) {
  let url = `/get_record.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const wifiScan = function wifiScan (socket, address, seq, creds) {
  let url = `/wifi_scan.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getWifiScanResult = function getWifiScanResult (socket, address, seq, creds) {
  let url = `/get_wifi_scan_result.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const login = function login (socket, address, seq, creds) {
  let url = `/login.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const cameraControl = function cameraControl (socket, address, seq, creds) {
  let url = `/camera_control.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getSnapshot = function getSnapshot (socket, address, seq, creds) {
  let url = `/snapshot.cgi?loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getAudioStream = function getAudioStream (socket, address, seq, creds, streamid = 1) {
  let url = `/audiostream.cgi?streamid=${streamid}&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const getVideoStream = function getVideoStream (socket, address, seq, creds, streamid = 10) {
  let url = `/livestream.cgi?streamid=${streamid}&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopAudioStream = function stopAudioStream (socket, address, seq, creds) {
  let url = `/audiostream.cgi?streamid=16&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopVideoStream = function stopVideoStream (socket, address, seq, creds) {
  let url = `/livestream.cgi?streamid=16&loginuse=${creds.user}&loginpas=${creds.pass}&user=${creds.user}&pwd=${creds.pass}&`
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
    let respHttpHeader = Buffer.allocUnsafe(4)
    msg.copy(respHttpHeader, 0, 4, 8)
    let payload = Buffer.allocUnsafe(msg.length - 8)
    msg.copy(payload, 0, 8)
    if (respHttpHeader[0] === 0xD1 && respHttpHeader[1] === 0x00) {
      return cb('http', {seq: seq, raw: msg.toString('hex'), payload: payload})
    } else if (respHttpHeader[0] === 0xD1 && respHttpHeader[1] === 0x01) {
      return cb('video', {seq: seq, raw: msg.toString('hex'), payload: payload})
    } else if (respHttpHeader[0] === 0xD1 && respHttpHeader[1] === 0x02) {
      return cb('audio', {seq: seq, raw: msg.toString('hex'), payload: payload})
    } else {
      return cb('unknownHttp', {seq: seq, raw: msg.toString('hex'), payload: payload})
    }
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

const stepDown = function stepDown (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=2&onestep=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stepUp = function stepUp (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=0&onestep=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stepRight = function stepRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=6&onestep=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stepLeft = function stepLeft (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=4&onestep=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveDown = function moveDown (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=2&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveUp = function moveUp (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=0&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveRight = function moveRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=6&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveLeft = function moveLeft (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=4&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopMoveDown = function stopMoveDown (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=3&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopMoveUp = function stopMoveUp (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=1&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopMoveRight = function stopMoveRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=7&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopMoveLeft = function stopMoveLeft (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=5&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveDownRight = function moveDownRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=93&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveUpRight = function moveUpRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=91&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveUpLeft = function moveUpLeft (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=90&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const moveDownLeft = function moveDownLeft (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=92&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const stopMove = function stopMove (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=1&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const resetPosition = function resetPosition (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=25&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const upAndDown = function upAndDown (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=26&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const leftAndRight = function leftAndRight (socket, address, seq, creds) {
  let url = `/decoder_control.cgi?command=28&onestep=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const reverseImage = function reverseImage (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=5&value=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const mirrorImage = function mirrorImage (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=5&value=2&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const resetImage = function resetImage (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=5&value=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const reverseAndMirrorImage = function reverseAndMirrorImage (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=5&value=3&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const activateInfrared = function activateInfrared (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=14&value=1&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

const deactivateInfrared = function deactivateInfrared (socket, address, seq, creds) {
  let url = `/camera_control.cgi?param=14&value=0&user=${creds.user}&pwd=${creds.pass}&`
  sendGet(socket, address, seq, url)
}

module.exports.openSession = openSession
module.exports.sendPing = sendPing
module.exports.sendPong = sendPong
module.exports.closeSession = closeSession
module.exports.parseMessage = parseMessage
module.exports.sendGet = sendGet
module.exports.checkCredentials = checkCredentials
module.exports.sendMultipleGet = sendMultipleGet
module.exports.getParams = getParams
module.exports.getStatus = getStatus
module.exports.getSnapshot = getSnapshot
module.exports.getAudioStream = getAudioStream
module.exports.getVideoStream = getVideoStream
module.exports.stopAudioStream = stopAudioStream
module.exports.stopVideoStream = stopVideoStream
module.exports.sendAuthenticatedGet = sendAuthenticatedGet
module.exports.getCameraParams = getCameraParams
module.exports.sendHttpAck = sendHttpAck
module.exports.sendAudioAck = sendAudioAck
module.exports.sendVideoAck = sendVideoAck
module.exports.parseHttp = parseHttp
module.exports.stepDown = stepDown
module.exports.stepUp = stepUp
module.exports.stepRight = stepRight
module.exports.stepLeft = stepLeft
module.exports.moveDown = moveDown
module.exports.moveUp = moveUp
module.exports.moveRight = moveRight
module.exports.moveLeft = moveLeft
module.exports.stopMoveDown = stopMoveDown
module.exports.stopMoveUp = stopMoveUp
module.exports.stopMoveRight = stopMoveRight
module.exports.stopMoveLeft = stopMoveLeft
module.exports.moveDownRight = moveDownRight
module.exports.moveUpRight = moveUpRight
module.exports.moveUpLeft = moveUpLeft
module.exports.moveDownLeft = moveDownLeft
module.exports.stopMove = stopMove
module.exports.resetPosition = resetPosition
module.exports.upAndDown = upAndDown
module.exports.leftAndRight = leftAndRight
module.exports.reverseImage = reverseImage
module.exports.mirrorImage = mirrorImage
module.exports.resetImage = resetImage
module.exports.reverseAndMirrorImage = reverseAndMirrorImage
module.exports.activateInfrared = activateInfrared
module.exports.deactivateInfrared = deactivateInfrared
module.exports.getFactoryParam = getFactoryParam
module.exports.cameraControl = cameraControl
module.exports.getMisc = getMisc
module.exports.login = login
module.exports.getRtsp = getRtsp
module.exports.getOnvif = getOnvif
module.exports.getRecord = getRecord
module.exports.wifiScan = wifiScan
module.exports.getWifiScanResult = getWifiScanResult
