import * as HID from 'node-hid';
import { delayMs } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { zeros } from '~/shell/services/device/KeyMappingEmitter/Helpers';

function getArrayFromBuffer(data: any) {
  return new Uint8Array(Buffer.from(data));
}

type IReceiverFunc = (buf: Uint8Array) => void;

export class DeviceWrapper {
  private device?: HID.HID | null = null;
  private receiverFunc?: IReceiverFunc;
  private closedCallback?: () => void;

  private static openTargetDevice(
    venderId: number,
    productId: number,
    pathSearchWords?: string[],
    serialNumberSearchWord?: string,
  ): HID.HID | null {
    const allDeviceInfos = HID.devices();
    // console.log(allDeviceInfos);
    const targetDeviceInfo = allDeviceInfos.find(
      (d) =>
        d.vendorId === venderId &&
        d.productId === productId &&
        (pathSearchWords
          ? d.path && pathSearchWords.some((word) => d.path!.includes(word))
          : true) &&
        (serialNumberSearchWord
          ? d.serialNumber?.includes(serialNumberSearchWord)
          : true),
    );
    if (targetDeviceInfo?.path) {
      return new HID.HID(targetDeviceInfo.path);
    } else {
      return null;
    }
  }

  open(
    venderId: number,
    productId: number,
    pathSearchWords?: string[],
    serialNumberSearchWord?: string,
  ): boolean {
    this.device = DeviceWrapper.openTargetDevice(
      venderId,
      productId,
      pathSearchWords,
      serialNumberSearchWord,
    );
    if (this.device) {
      this.device.on(
        'data',
        withAppErrorHandler((data) => {
          const buf = getArrayFromBuffer(data);
          if (this.receiverFunc) {
            this.receiverFunc(buf);
          }
        }),
      );
      this.device.on(
        'error',
        withAppErrorHandler((error) => {
          console.log(`error occured: ${error}`);
          this.closedCallback?.();
        }),
      );
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

  onClosed(callback: () => void) {
    this.closedCallback = callback;
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

    // console.log(`sending ${buf.length} bytes:`);
    // console.log(buf.map(v => ('00' + v.toString(16)).slice(-2)).join(' '));
    // console.log(bytes.map((v) => ('00' + v.toString(16)).slice(-2)).join(' '));

    buf.unshift(0); // 先頭に0を付加して送信

    this.device?.write(buf);
  }

  async writeFrames(frames: number[][]) {
    for (let i = 0; i < frames.length; i++) {
      this.writeSingleFrame(frames[i]);
      // await delayMs(10);
      await delayMs(50); // debug
    }
  }
}
