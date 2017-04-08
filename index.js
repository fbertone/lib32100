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
  let currentCamSession = {
    init: false,
    active: false,
    address: {host: null, port: null},
    mySeq: 0,
    lastACK: null,
    lastRemoteSeq: null,
    lastRemoteACKed: null
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
        camClient.parseMessage(msg, (type, info) => {
          emitter.emit(type, info)
          if ((type === 'pingpong') && (info.subtype === 'ping')) {
            // keep the session alive
            camClient.sendPong(socket, {host: rinfo.address, port: rinfo.port})
          }
        })
      } else { // unknown sender
        emitter.emit('unknownSender', JSON.stringify(rinfo) + ' - ' + msg.toString('hex'))
      }
    })

  const addServer = function addServer (address) {
    if (!address || !address.host || !address.port) {
      return
    } else {
      if (!addressExists(servers, address)) {
        servers.push(address)
      }
    }
  }

  const addCamAddress = function addCamAddress (address) {
    if (!address || !address.host || !address.port) {
      return
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

  const on = function on (ev, cb) {
    emitter.addListener(ev, cb)
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
    on
  }
}

const addressExists = function addressExists (arr, address) {
  return arr.some(function (el) {
    return (el.host === address.host && el.port === address.port)
  })
}

module.exports.client = client
