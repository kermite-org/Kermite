import { delayMs, DeviceWrapper } from './DeviceWrapper'
import { bhi, blo, calcChecksum, iota } from './Helpers'
import {
  makeKeyAssignsTransmitData,
  makeTestKeyAssignsData
} from './TestKeyAssignsDataGenerator'

//------------------------------------------------------------

function makeMemoryWriteOperationFrames(
  bytes: number[],
  dataKind: number
): number[][] {
  const sz = 58
  const numFrames = Math.ceil(bytes.length / sz)
  return iota(numFrames).map((k) => {
    const addr = k * sz
    const data = bytes.slice(addr, addr + sz)
    return [0xb0, dataKind, 0x20, blo(addr), bhi(addr), data.length, ...data]
  })
}

function makeMemoryChecksumRequestFrame(
  dataKind: number,
  addr: number,
  length: number
): number[] {
  return [0xb0, dataKind, 0x21, blo(addr), bhi(addr), blo(length), bhi(length)]
}

//------------------------------------------------------------

function dev1() {
  const dw = new DeviceWrapper()
  const isOpen = dw.open(0xf055, 0xa577, [
    //find interface 0 by searching words in device.path
    'mi_00', //Windows
    'IOUSBHostInterface@0' //Mac
  ])

  if (!isOpen) {
    console.log('failed to open device')
    return
  }

  dw.setReceiverFunc((buf) => {
    if (buf[0] == 0xe0 && buf[1] == 0x90) {
      const keyIndex = buf[2]
      const isDown = buf[3]
      console.log(`keystate changed ${keyIndex}, ${isDown}`)
    }

    if (buf[0] == 0xe0 && buf[1] == 0x91) {
      const layerIndex = buf[2]
      console.log(`layer changed ${layerIndex}`)
    }

    if (buf[0] == 0xb0) {
      if (buf[1] == 0x01 && buf[2] == 0x22) {
        const checksum = buf[3]
        console.log(`checksum received: %d`, checksum)
      }
    }
    if (buf[0] == 0xf0 && buf[1] == 0x11) {
      const keyNum = buf[2]
      const side = buf[3]
      console.log(`device attributes`, { keyNum, side })
    }
  })

  if (0) {
    //フレーム送信確認
    const data = [0xe0, 0, 3, 0xab, 0xcd, 0xef]
    console.log(data)
    dw.writeSingleFrame(data)
    console.log(`write done`)
    process.exit()
  }

  // if (1) {
  //   console.log('writing...')
  //   const data = Array(202)
  //     .fill(0)
  //     .map((_, idx) => idx + 10)
  //   console.log(`len: ${data.length}`)
  //   const frames = splitBytesIntoFrames(data, 64, 0xa0)
  //   // frames.forEach(f => console.log(f))
  //   dw.writeFrames(frames, () => {
  //     console.log('write done')
  //     process.exit()
  //   })
  // }

  if (0) {
    //キーマッピングデータ書き込み
    const data = makeKeyAssignsTransmitData(makeTestKeyAssignsData())

    const checksum = calcChecksum(data)
    const dataLength = data.length
    console.log(`len: ${dataLength}, checksum: ${checksum}`)

    const keyAssingnDataFrames = makeMemoryWriteOperationFrames(data, 0x01)
    const checksumRequestFrame = makeMemoryChecksumRequestFrame(
      0x01,
      0,
      dataLength
    )
    ;(async () => {
      try {
        console.log('writing...')
        await dw.writeSingleFrame([0xb0, 0x01, 0x10])
        delayMs(50)
        await dw.writeFrames(keyAssingnDataFrames)

        dw.writeSingleFrame(checksumRequestFrame)
        delayMs(50)
        await dw.writeSingleFrame([0xb0, 0x01, 0x11])
        console.log('write done')
        await delayMs(1000)
        process.exit()
      } catch (err) {
        console.log(err)
      }
    })()
  }

  if (0) {
    //device attributes取得
    ;(async () => {
      try {
        console.log(`query device attributes`)
        dw.writeSingleFrame([0xf0, 0x10])
        await delayMs(1000)
        process.exit()
      } catch (err) {
        console.log(err)
      }
    })()
  }
}

dev1()
