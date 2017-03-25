[npm-image]: https://img.shields.io/badge/npm-v1.0.0-blue.svg
[npm-url]: https://npmjs.org/package/lib32100
[![npm][npm-image]][npm-url]
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


# lib32100
Library implementing port 32100 UDP Cloud protocol used by many P2P cameras.

## Install
```bash
npm install --save lib32100
```

## Usage
Require the Library
```
const lib32100 = require('lib32100')
```
Istantiate a client
```
const client = lib32100.client()
```
Note that each client can handle **one device** (camera) and **multiple cloud servers**.

Add servers
```
client.addServer({host: "myserver.example.com", port: 32100})
```

Set the device UID
```
client.setUid('PROD123456ABCDE')
```

Add listeners
```
client.on('stun', (e) => console.log(JSON.stringify(e)))
client.on('lookup', (e) => console.log(JSON.stringify(e)))
```

Send commands to the Cloud servers
```
client.sendSTUNRequest()
client.lookupUid()
```

### Events
You can listen on the following events:
```
stun
lookup
lookupACK
unknownMsg
```


## DISCLAIMER
This implementation is not based on official specs but purely on reverse engineering of the protocol.
I cannot guarantee it will work on every device.

## License
MIT. Copyright (c) Fabrizio Bertone
