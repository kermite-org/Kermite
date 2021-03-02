import * as HID from 'node-hid';
import { delayMs } from '~/shared';
import { withAppErrorHandler } from '~/shell/base/ErrorChecker';
import { makeListenerPort } from '~/shell/funcs';
import {
  getArrayFromBuffer,
  zeros,
} from '~/shell/services/device/KeyboardDevice/Helpers';

// function openTargetDevice(
//   venderId: number,
//   productId: number,
//   pathSearchWords?: string[],
//   serialNumberSearchWord?: string,
// ): HID.HID | undefined {
//   const allDeviceInfos = HID.devices();
//   // console.log(allDeviceInfos);
//   const targetDeviceInfo = allDeviceInfos.find(
//     (d) =>
//       d.vendorId === venderId &&
//       d.productId === productId &&
//       (pathSearchWords
//         ? d.path && pathSearchWords.some((word) => d.path!.includes(word))
//         : true) &&
//       (serialNumberSearchWord
//         ? d.serialNumber?.includes(serialNumberSearchWord)
//         : true),
//   );
//   if (targetDeviceInfo?.path) {
//     return new HID.HID(targetDeviceInfo.path);
//   }
//   return undefined;
// }

type IReceiverFunc = (buf: Uint8Array) => void;
type IClosedCallback = () => void;

export interface IDeviceWrapper {
  close(): void;
  onClosed(callback: IClosedCallback): void;
  onData(func: IReceiverFunc): void;
  writeSingleFrame(bytes: number[]): Promise<void>;
  writeFrames(frames: number[][]): Promise<void>;
}

/*
export class DeviceWrapper implements IDeviceWrapper {
  private device?: HID.HID | undefined;
  private receiverFunc?: IReceiverFunc;
  private closedCallback?: () => void;

  onClosed(callback: () => void) {
    this.closedCallback = callback;
  }

  setReceiverFunc(func: IReceiverFunc) {
    this.receiverFunc = func;
  }

  open(
    venderId: number,
    productId: number,
    pathSearchWords?: string[],
    serialNumberSearchWord?: string,
  ): boolean {
    const device = openTargetDevice(
      venderId,
      productId,
      pathSearchWords,
      serialNumberSearchWord,
    );
    if (!device) {
      return false;
    }
    device.on(
      'data',
      withAppErrorHandler((data) => {
        const buf = getArrayFromBuffer(data);
        if (this.receiverFunc) {
          this.receiverFunc(buf);
        }
      }),
    );
    device.on(
      'error',
      withAppErrorHandler((error) => {
        console.log(`error occured: ${error}`);
        this.closedCallback?.();
      }),
    );
    this.device = device;
    return true;
  }

  close() {
    if (this.device) {
      this.device.close();
      this.device = undefined;
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async writeSingleFrame(bytes: number[]) {
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
      await this.writeSingleFrame(frames[i]);
      // await delayMs(10);
      await delayMs(50); // debug
    }
  }
}
*/
export class DeviceWrapper2 implements IDeviceWrapper {
  private device?: HID.HID | undefined;
  // private receiverFunc?: IReceiverFunc;
  // private closedCallback?: IClosedCallback;

  onData = makeListenerPort<Uint8Array>();
  onClosed = makeListenerPort<void>();

  // setReceiverFunc(func: IReceiverFunc) {
  //   this.receiverFunc = func;
  // }

  // onClosed(callback: IClosedCallback) {
  //   this.closedCallback = callback;
  // }

  static openDeviceByPath(path: string): DeviceWrapper2 | undefined {
    const instance = new DeviceWrapper2();
    const ok = instance.open(path);
    if (ok) {
      return instance;
    }
    return undefined;
  }

  private open(path: string): boolean {
    const device = new HID.HID(path);
    if (!device) {
      return false;
    }
    device.on(
      'data',
      withAppErrorHandler((data) => {
        const buf = getArrayFromBuffer(data);
        this.onData.emit(buf);
      }),
    );
    device.on(
      'error',
      withAppErrorHandler((error) => {
        console.log(`error occured: ${error}`);
        this.onClosed.emit();
      }),
    );
    // device.on('close', () => {})
    this.device = device;
    return true;
  }

  close() {
    if (this.device) {
      this.device.close();
      this.device = undefined;
      this.onData.purge();
      this.onClosed.purge();
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async writeSingleFrame(bytes: number[]) {
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
      await this.writeSingleFrame(frames[i]);
      // await delayMs(10);
      await delayMs(50); // debug
    }
  }
}
