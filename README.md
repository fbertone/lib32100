[![npm](https://img.shields.io/npm/v/lib32100.svg)](https://npmjs.org/package/lib32100)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


# lib32100
Library implementing port 32100 UDP Cloud protocol used by many P2P cameras.
You can find a description of the protocol in the [wiki](https://github.com/fbertone/lib32100/wiki)

## Install

```bash
npm install --save lib32100
```

## Usage

Require the Library
```javascript
const lib32100 = require('lib32100')
```

Istantiate a client
```javascript
const client = lib32100.client()
```
Note that each client can handle **one device** (camera) and **multiple cloud servers**.

Add servers
```javascript
client.addServer({host: "myserver.example.com", port: 32100})
```

Set the device UID
```javascript
client.setUid('PROD123456ABCDE')
```

Add listeners
```javascript
client.on('stun', (e) => console.log(JSON.stringify(e)))
client.on('lookup', (e) => console.log(JSON.stringify(e)))
```

Send commands to the Cloud servers
```javascript
client.sendSTUNRequest()
client.lookupUid()
```

Add camera address
```javascript
client.addCamAddress({host: "192.168.0.100", port: 10088})
```

Set camera credentials
```javascript
client.setCamCredentials({user: 'admin', pass: 'password'})
```

Open direct camera session
```javascript
client.openDirectCamSession({host: "192.168.0.100", port: 10088})
```

Check credentials
```javascript
client.checkCredentials()
```

Get snapshot
```javascript
client.getSnapshot()
```

Send custom GET request
```javascript
client.sendGet('/custom_url.cgi?myparam=hello')
```

Send multiple GET requests
```javascript
client.sendMultipleGet(['/custom_url1.cgi', '/custom_url2.cgi', '/custom_url3.cgi'])
```

Get live video stream
```javascript
client.getVideoStream()
```

Get live audio stream
```javascript
client.getAudioStream()
```

Stop video stream
```javascript
client.stopVideoStream()
```

Stop audio stream
```javascript
client.stopAudioStream()
```

Get various information
```javascript
client.getParams()
client.getCameraParams()
client.getFactoryParam()
client.getStatus()
client.cameraControl()
client.getMisc()
client.login()
client.getRtsp()
client.getOnvif()
client.getRecord()
client.wifiScan()
client.getWifiScanResult()
```

Move in directions in steps
```javascript
client.stepDown()
client.stepLeft()
client.stepRight()
client.stepUp()
```

Move in directions
```javascript
client.moveDown()
client.moveLeft()
client.moveRight()
client.moveUp()
client.stopMove()
```

Close session
```javascript
client.closeCamSession()
```

### Events

You can listen on the following events:
```
stun (server response)
lookup (server response)
lookupACK (server response)
unknownMsg (any message not yet parsable by the library)
pingpong (camera ping or pong)
close (camera closed session)
confirmed (camera comfirmed ID i.e. session opened)
ack (camera acked a message)
http (an http response)
audio (live audio data)
video (live video data)
complete (a complete http response)
lostConnection (the connection was lost)
```

## TODO

- [ ] improve documentation
- [ ] improve reliability (add various checks / validations)
- [ ] parse camera id in response
- [ ] automate connection (from uid lookup to selecting the address)
- [ ] add other connection methods (relays, ...)
- [ ] add methods to retrieve / set parameters / reboot / etc
- [ ] parse responses
- [ ] add more details in events
- [ ] verify send acks and correct sequence numbers
- [ ] add callbacks / promises
- [ ] authenticated http requests
- [ ] send audio to the camera
- [ ] implement server
- [ ] emulate camera
- [ ] translate stream to RTP

## DISCLAIMER
This implementation is not based on official specs but purely on reverse engineering of the protocol.
I cannot guarantee it will work on every device.

## License
MIT. Copyright (c) Fabrizio Bertone
