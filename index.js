const dgram = require('dgram')
const EventEmitter = require('events')
const util = require('util')

const camClient = require('./lib/camClient')
const cloudClient = require('./lib/cloudClient')

const client = function client (opts = {}, udpSocket) {
  let socket
  let servers = opts.servers ? opts.servers : []
  let uid = opts.uid ? opts.uid : ''
  let camAddresses = opts.camDirectAddresses ? opts.camDirectAddresses : []
  let emitter = new EventEmitter()

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
        camClient.parseMessage(msg, (type, info) => { emitter.emit(type, info) })
      } else { // unknown sender

      }
    })

  const addServer = function addServer (address) {
    if (!addressExists(servers, address)) {
      servers.push(address)
    }
  }

  const setUid = function setUid (newUid) {
    uid = newUid
  }

  const sendSTUNRequest = function sendSTUNRequest () {
    servers.forEach((address) => { cloudClient.sendSTUN(socket, address) })
  }

  const lookupUid = function lookupUid (uidToCheck) {
    if (!uidToCheck) {
      uidToCheck = uid
    }
    servers.forEach((address) => { cloudClient.lookupUid(socket, address, uidToCheck) })
  }

  const on = function on (ev, cb) {
    emitter.addListener(ev, cb)
  }

  return {
    addServer,
    setUid,
    sendSTUNRequest,
    lookupUid,
    on
  }
}

//  TODO check EventEmitter

util.inherits(client, EventEmitter)

const addressExists = function addressExists (arr, address) {
  return arr.some(function (el) {
    return (el.host === address.host && el.port === address.port)
  })
}

module.exports.client = client
