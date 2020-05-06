import * as HID from 'node-hid'
import { zeros } from './Helpers'

function getArrayFromBuffer(data: any) {
  return new Uint8Array(Buffer.from(data))
}

export function delayMs(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n))
}

function openTargetDevice(
  vendorId: number,
  productId: number,
  pathSearchWords: string[]
): HID.HID | null {
  var allDeviceInfos = HID.devices()
  console.log(allDeviceInfos)

  // console.log({ vendorId, productId, pathSearchWord })
  const targetDeviceInfo = allDeviceInfos.find(
    (d) =>
      d.vendorId == vendorId &&
      d.productId == productId &&
      d.path &&
      pathSearchWords.some((word) => d.path.indexOf(word) >= 0)
  )
  console.log(targetDeviceInfo)
  if (!targetDeviceInfo) {
    return null
    //throw new Error('target device not found')
  }
  return new HID.HID(targetDeviceInfo.path!)
}

type IReceiverFunc = (buf: Uint8Array) => void

export class DeviceWrapper {
  device?: HID.HID | null = null
  receiverFunc?: IReceiverFunc

  open(
    vendorId: number,
    productId: number,
    pathSearchWords: string[]
  ): boolean {
    this.device = openTargetDevice(vendorId, productId, pathSearchWords)
    //this.device = new HID.HID(venderId, productId)
    if (this.device) {
      this.device.on('data', this.onData)
      this.device.on('error', this.onError)
      return true
    } else {
      return false
    }
  }

  onData = (data: any) => {
    let buf = getArrayFromBuffer(data)
    //console.log(`data received ${this.didx++}: ${buf}`)
    if (this.receiverFunc) {
      this.receiverFunc(buf)
    }
  }

  onError = (error: any) => {
    console.log(`error occured: ${error}`)
  }

  setReceiverFunc(func: IReceiverFunc) {
    this.receiverFunc = func
  }

  writeSingleFrame(bytes: number[]) {
    if (bytes.length > 64) {
      throw new Error(`generic hid frame length too long, ${bytes.length}/64`)
    }
    const padding = zeros(64 - bytes.length)
    const buf = [...bytes, ...padding]

    console.log(`sending ${buf.length} bytes:`)
    console.log(buf.map((v) => ('00' + v.toString(16)).slice(-2)).join(' '))

    buf.unshift(0) //windowsの場合先頭に0を付加して送信

    this.device && this.device.write(buf)
  }

  async writeFrames(frames: number[][]) {
    for (let i = 0; i < frames.length; i++) {
      this.writeSingleFrame(frames[i])
      //await delayMs(10);
      await delayMs(50) //debug
    }
  }
}
