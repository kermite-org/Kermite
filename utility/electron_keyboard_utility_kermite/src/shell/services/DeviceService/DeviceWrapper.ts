import * as HID from 'node-hid';
import { zeros, delayMs } from './Helpers';

function getArrayFromBuffer(data: any) {
  return new Uint8Array(Buffer.from(data));
}

type IReceiverFunc = (buf: Uint8Array) => void;

export class DeviceWrapper {
  private device?: HID.HID | null = null;
  private receiverFunc?: IReceiverFunc;

  private static openTargetDevice(
    venderId: number,
    productId: number,
    pathSearchWords?: string[],
    serialNumberSearchWord?: string
  ): HID.HID | null {
    const allDeviceInfos = HID.devices();
    // console.log(allDeviceInfos);
    const targetDeviceInfo = allDeviceInfos.find(
      d =>
        d.vendorId === venderId &&
        d.productId === productId &&
        (pathSearchWords
          ? d.path && pathSearchWords.some(word => d.path!.indexOf(word) >= 0)
          : true) &&
        (serialNumberSearchWord
          ? d.serialNumber &&
            d.serialNumber.indexOf(serialNumberSearchWord) >= 0
          : true)
    );
    if (targetDeviceInfo && targetDeviceInfo.path) {
      return new HID.HID(targetDeviceInfo.path);
    } else {
      return null;
    }
  }

  open(
    venderId: number,
    productId: number,
    pathSearchWords?: string[],
    serialNumberSearchWord?: string
  ): boolean {
    this.device = DeviceWrapper.openTargetDevice(
      venderId,
      productId,
      pathSearchWords,
      serialNumberSearchWord
    );
    if (this.device) {
      this.device.on('data', data => {
        const buf = getArrayFromBuffer(data);
        if (this.receiverFunc) {
          this.receiverFunc(buf);
        }
      });
      this.device.on('error', error => {
        console.log(`error occured: ${error}`);
      });
      return true;
    } else {
      return false;
    }
  }

  close() {
    if (this.device) {
      this.device.close();
      this.device = null;
    }
  }

  setReceiverFunc(func: IReceiverFunc) {
    this.receiverFunc = func;
  }

  writeSingleFrame(bytes: number[]) {
    if (bytes.length > 64) {
      throw new Error(`generic hid frame length too long, ${bytes.length}/64`);
    }
    const padding = zeros(64 - bytes.length);
    const buf = [...bytes, ...padding];

    console.log(`sending ${buf.length} bytes:`);
    console.log(buf.map(v => ('00' + v.toString(16)).slice(-2)).join(' '));

    buf.unshift(0); //先頭に0を付加して送信

    this.device && this.device.write(buf);
  }

  async writeFrames(frames: number[][]) {
    for (let i = 0; i < frames.length; i++) {
      this.writeSingleFrame(frames[i]);
      //await delayMs(10);
      await delayMs(50); //debug
    }
  }
}
