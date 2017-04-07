const sendMessage = function sendMessage (socket, address, msgID, payload, cb = () => {}) {
  if (!payload) payload = Buffer.from([])
  let payloadLen = Buffer.from([Math.floor(payload.length / 256), payload.length % 256])

  let message = Buffer.concat([msgID, payloadLen, payload], 4 + payload.length)

  sendPackage(socket, address, message, function (err, bytes) {
    if (err) {
      return cb(err)
    } else {
      return cb(null, bytes)
    }
  })
}

const sendPackage = function sendPackage (socket, address, pkg, cb = () => {}) {
  socket.send(pkg, address.port, address.host, function (err, bytes) {
    if (err) {
      return cb(err)
    } else {
      return cb(null, bytes)
    }
  })
}

const uid365toBuffer = function uid365toBuffer (uid) {
  let literalUID = Buffer.from(uid.substr(0, 3))

//  var newUID = Buffer.from([uid[0], uid[1], uid[2], uid[3], 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x55, 0x5f, uid[10], uid[11], uid[12], uid[13], uid[14]])

  let digit = Number(uid.substr(3, 6))

  let str = digit.toString(16)
  let first = 0
  let second = 0
  let third = 0

  switch (str.length) {
    case 1:
      str = '00000' + str
      break
    case 2:
      str = '0000' + str
      break
    case 3:
      str = '000' + str
      break
    case 4:
      str = '00' + str
      break
    case 5:
      str = '0' + str
      break
  }

  first = parseInt(str.substr(0, 2), 16)
  second = parseInt(str.substr(2, 2), 16)
  third = parseInt(str.substr(4, 2), 16)

  let numeric = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, first, second, third]
  let numericUID = Buffer.from(numeric)
  let randomUID = Buffer.from(uid.substr(9, 5))
  let newUID = Buffer.concat([literalUID, numericUID, randomUID, Buffer.from([0x00, 0x00, 0x00])], 20)
  return newUID
}

const uid465toBuffer = function uid465toBuffer (uid) {
  let literalUID = Buffer.from(uid.substr(0, 4))

//  var newUID = Buffer.from([uid[0], uid[1], uid[2], uid[3], 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x55, 0x5f, uid[10], uid[11], uid[12], uid[13], uid[14]])

  let digit = Number(uid.substr(4, 6))

  let str = digit.toString(16)
  let first = 0
  let second = 0
  let third = 0

  switch (str.length) {
    case 1:
      str = '00000' + str
      break
    case 2:
      str = '0000' + str
      break
    case 3:
      str = '000' + str
      break
    case 4:
      str = '00' + str
      break
    case 5:
      str = '0' + str
      break
  }

  first = parseInt(str.substr(0, 2), 16)
  second = parseInt(str.substr(2, 2), 16)
  third = parseInt(str.substr(4, 2), 16)

  let numeric = [0x00, 0x00, 0x00, 0x00, 0x00, first, second, third]
  let numericUID = Buffer.from(numeric)
  let randomUID = Buffer.from(uid.substr(10, 5))
  let newUID = Buffer.concat([literalUID, numericUID, randomUID, Buffer.from([0x00, 0x00, 0x00])], 20)
  return newUID
}

module.exports.sendMessage = sendMessage
module.exports.sendPackage = sendPackage
module.exports.uid465toBuffer = uid465toBuffer
module.exports.uid365toBuffer = uid365toBuffer
