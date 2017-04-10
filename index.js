const dgram = require('dgram')
const EventEmitter = require('events')
// const util = require('util')

const camClient = require('./lib/camClient')
const cloudClient = require('./lib/cloudClient')

const client = function client (opts = {}, udpSocket) {
  let socket
  let servers = opts.servers ? opts.servers : []
  let uid = opts.uid ? opts.uid.replace(/-/g, '') : ''
  let camAddresses = opts.camDirectAddresses ? opts.camDirectAddresses : []
  let camCredentials = opts.credentials ? opts.credentials : {user: 'admin', pass: ''}
  let emitter = new EventEmitter()
  let currentBuffer = Buffer.from([])
  let currentCamSession = {
    init: false,
    active: false,
    address: {host: null, port: null},
    mySeq: 0,
    lastACK: null,
    lastRemoteSeq: null,
    lastRemoteACKed: null,
    lastTimeReceivedPacket: null,
    remoteSeqs: [],
    pingerId: null,
    ackerId: null,
    receivedIds: 0,
    receivedFirstPacket: false,
    bytesToReceive: 0,
    receivedBytes: 0
  }

  if (udpSocket) {
    socket = udpSocket
  } else {
    socket = dgram.createSocket('udp4')
    socket.bind()
  }

  socket.on('message',
    function (msg, rinfo) { // check if message is from a server or the camera
      if (addressExists(servers, {host: rinfo.address, port: rinfo.port})) {
        cloudClient.parseMessage(msg, (type, info) => { emitter.emit(type, info) })
      } else if (addressExists(camAddresses, {host: rinfo.address, port: rinfo.port})) {
        currentCamSession.lastTimeReceivedPacket = Date.now()
        camClient.parseMessage(msg, (type, info) => {
          emitter.emit(type, info)
          if ((type === 'pingpong') && (info.subtype === 'ping')) {
            // keep the session alive
            camClient.sendPong(socket, {host: rinfo.address, port: rinfo.port})
          } else if ((type === 'confirmed') && (!currentCamSession.active)) {
            currentCamSession.active = true
            currentCamSession.receivedIds++
            camClient.openSession(socket, {host: rinfo.address, port: rinfo.port}, uid)
//            camClient.sendPing(socket, {host: rinfo.address, port: rinfo.port})
            currentCamSession.pingerId = setInterval(() => {
              camClient.sendPing(socket, {host: rinfo.address, port: rinfo.port})
              let now = Date.now()
              let past = now - currentCamSession.lastTimeReceivedPacket
              if (past > 10000) {
                emitter.emit('lostConnection', {lastReceived: currentCamSession.lastTimeReceivedPacket, timePast: past, message: `not receiving packets since ${past / 1000} seconds`})
              }
            }, 1000)
            currentCamSession.ackerId = setInterval(() => {
              camClient.sendAck(socket, {host: rinfo.address, port: rinfo.port}, currentCamSession.remoteSeqs)
              currentCamSession.remoteSeqs = []
            }, 50)
          } else if ((type === 'confirmed') && (currentCamSession.active)) {
            currentCamSession.receivedIds++
            if (currentCamSession.receivedIds < 4) {
              camClient.openSession(socket, {host: rinfo.address, port: rinfo.port}, uid)
            } else {
              camClient.sendPing(socket, {host: rinfo.address, port: rinfo.port})
            }
          } else if ((type === 'close') && (currentCamSession.active)) {
            cleanUpSession()
          } else if (type === 'http') {
            currentCamSession.remoteSeqs.push(info.seq)
            if (!currentCamSession.lastRemoteSeq || currentCamSession.lastRemoteSeq < info.seq) {
              currentCamSession.lastRemoteSeq = info.seq
            }
            if (!currentCamSession.receivedFirstPacket) {
              currentCamSession.receivedFirstPacket = true
              currentCamSession.receivedBytes = msg.length - 16
              camClient.parseHttp(msg, (info) => {
                console.log('bytes to expect: ' + info.size)
                currentCamSession.bytesToReceive = info.size
                currentBuffer = info.payload
                if (info.size === currentCamSession.receivedBytes) {
                  emitter.emit('complete', {data: currentBuffer})
                  currentCamSession.receivedFirstPacket = false
                  currentCamSession.receivedBytes = 0
                  currentCamSession.bytesToReceive = 0
                }
              })
            } else {
              currentCamSession.receivedBytes += (msg.length - 8)
              currentBuffer = Buffer.concat([currentBuffer, info.payload])
              if (currentCamSession.bytesToReceive === currentCamSession.receivedBytes) {
                emitter.emit('complete', {data: currentBuffer})
                currentCamSession.receivedFirstPacket = false
                currentCamSession.receivedBytes = 0
                currentCamSession.bytesToReceive = 0
              }
            }
          }
        })
      } else { // unknown sender
        emitter.emit('unknownSender', JSON.stringify(rinfo) + ' - ' + msg.toString('hex'))
      }
    })

  const addServer = function addServer (address) {
    if (!address || !address.host || !address.port) {
    } else {
      if (!addressExists(servers, address)) {
        servers.push(address)
      }
    }
  }

  const addCamAddress = function addCamAddress (address) {
    if (!address || !address.host || !address.port) {
    } else {
      if (!addressExists(camAddresses, address)) {
        camAddresses.push(address)
      }
    }
  }

  const setCamCredentials = function setCamCredentials (credentials) {
    camCredentials = credentials
  }

  const setUid = function setUid (newUid) {
    uid = newUid.replace(/-/g, '')
  }

  const sendSTUNRequest = function sendSTUNRequest () {
    servers.forEach((address) => { cloudClient.sendSTUN(socket, address) })
  }

  const lookupUid = function lookupUid (uidToCheck) {
    if (!uidToCheck) {
      uidToCheck = uid
    } else {
      uidToCheck = uidToCheck.replace(/-/g, '')
    }
    servers.forEach((address) => {
      cloudClient.lookupUid(socket, address, uidToCheck, (error) => {
        if (error) {
          emitter.emit('error', error)
        }
      })
    })
  }

  const openDirectCamSession = function openDirectCamSession (address) {
    currentCamSession.init = true
    addCamAddress(address)
    currentCamSession.address = address
    camClient.openSession(socket, address, uid)
  }

  const closeCamSession = function closeCamSession () {
    camClient.closeSession(socket, currentCamSession.address)
    cleanUpSession()
  }

  const checkCredentials = function checkCredentials () {
    camClient.checkCredentials(socket, currentCamSession.address, currentCamSession.mySeq, camCredentials)
    currentCamSession.mySeq++
  }

  const getSnapshot = function getSnapshot () {
    camClient.getSnapshot(socket, currentCamSession.address, currentCamSession.mySeq, camCredentials)
    currentCamSession.mySeq++
  }

  const sendMultipleGet = function sendMultipleGet (urls) {
    // TOTO check request length and eventually split in multiple requests
    camClient.sendMultipleGet(socket, currentCamSession.address, currentCamSession.mySeq, urls)
    currentCamSession.mySeq++
  }

// TODO: add authentication parameters
  const sendGet = function sendGet (url) {
    camClient.sendGet(socket, currentCamSession.address, currentCamSession.mySeq, url)
    currentCamSession.mySeq++
  }

  const sendPing = function sendPing () {
    camClient.sendPing(socket, currentCamSession.address)
  }

  const on = function on (ev, cb) {
    emitter.addListener(ev, cb)
  }

  // TODO
  function cleanUpSession () {
    currentCamSession.active = false
    if (currentCamSession.pingerId) {
      clearInterval(currentCamSession.pingerId)
    }
    if (currentCamSession.ackerId) {
      clearInterval(currentCamSession.ackerId)
    }
  }

  return {
    addServer,
    setUid,
    sendSTUNRequest,
    lookupUid,
    setCamCredentials,
    addCamAddress,
    openDirectCamSession,
    closeCamSession,
    checkCredentials,
    sendMultipleGet,
    sendGet,
    getSnapshot,
    sendPing,
    on
  }
}

const addressExists = function addressExists (arr, address) {
  return arr.some(function (el) {
    return (el.host === address.host && el.port === address.port)
  })
}

module.exports.client = client
