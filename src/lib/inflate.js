function _unmask(payload, maskingKey) {
  const result = Buffer.alloc(payload.byteLength)

  for (let i = 0; i < payload.byteLength; ++i) {
    const j = i % 4
    const maskingKeyByteShift = j === 3 ? 0 : (3 - j) << 3
    const maskingKeyByte =
      (maskingKeyByteShift === 0
        ? maskingKey
        : maskingKey >>> maskingKeyByteShift) & 0b11111111
    const transformedByte = maskingKeyByte ^ payload.readUInt8(i)
    result.writeUInt8(transformedByte, i)
  }

  return result
}

function parseFrame(buffer) {
  var OPCODES = { text: 0x01, close: 0x08 }

  const firstByte = buffer.readUInt8(0)
  const opCode = firstByte & 0b00001111 // get last 4 bits of a byte

  if (opCode === OPCODES.close) {
    return null
  } else if (opCode !== OPCODES.text) {
    return
  }
  const secondByte = buffer.readUInt8(1)

  let offset = 2
  let payloadLength = secondByte & 0b01111111 // get last 7 bits of a second byte

  if (payloadLength === 126) {
    offset += 2
  } else if (payloadLength === 127) {
    offset += 8
  }

  const isMasked = Boolean((secondByte >>> 7) & 0b00000001) // get first bit of a second byte

  if (isMasked) {
    const maskingKey = buffer.readUInt32BE(offset) // read 4-byte (32-bit) masking key
    offset += 4
    const payload = buffer.subarray(offset)
    const result = _unmask(payload, maskingKey)
    return result.toString('utf-8')
  }

  return buffer.subarray(offset).toString('utf-8')
}

module.exports = { parseFrame }
