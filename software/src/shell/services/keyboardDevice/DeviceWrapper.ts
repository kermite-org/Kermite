// import * as HID from 'node-hid';
import {
  delayMs,
  fallbackKeyboardDeviceInfo,
  IKeyboardDeviceInfo,
} from '~/shared';
import { IListenerPortImpl, makeListenerPort } from '~/shell/funcs';
import {
  getArrayFromBuffer,
  zeros,
} from '~/shell/services/keyboardDevice/Helpers';

export interface IDeviceWrapper {
  close(): void;
  onData: IListenerPortImpl<Uint8Array>;
  onClosed: IListenerPortImpl<void>;
  writeSingleFrame(bytes: number[]): void;
  writeFrames(frames: number[][]): Promise<void>;
  keyboardDeviceInfo: IKeyboardDeviceInfo;
}
export class DeviceWrapper implements IDeviceWrapper {
  // private device?: HID.HID | undefined;
  private device?: undefined;

  onData = makeListenerPort<Uint8Array>();
  onClosed = makeListenerPort<void>();

  _keyboardDeviceInfo: IKeyboardDeviceInfo = fallbackKeyboardDeviceInfo;

  get keyboardDeviceInfo() {
    return this._keyboardDeviceInfo;
  }

  setKeyboardDeviceInfo(info: IKeyboardDeviceInfo) {
    this._keyboardDeviceInfo = info;
  }

  static openDeviceByPath(path: string): DeviceWrapper | undefined {
    const instance = new DeviceWrapper();
    const ok = instance.open(path);
    if (ok) {
      return instance;
    }
    return undefined;
  }

  private open(path: string): boolean {
    throw new Error('obsolete function invoked');

    // const device = new HID.HID(path);
    // if (!device) {
    //   return false;
    // }
    // device.on('data', this.handleData);
    // device.on('error', this.handleError);
    // this.device = device;
    // return true;
  }

  private handleData = (data: any) => {
    const buf = getArrayFromBuffer(data);
    // console.log(`received: ${bytesToHexString([...buf])}`);
    this.onData.emit(buf);
  };

  private handleError = (error: any) => {
    console.log(`hid device error occurred: ${error}`);
    this.close();
  };

  close() {
    if (this.device) {
      // this.device.close();
      this.onClosed.emit();
      this.onData.purge();
      this.onClosed.purge();
      this.device = undefined;
      this._keyboardDeviceInfo = fallbackKeyboardDeviceInfo;
    }
  }

  writeSingleFrame(bytes: number[]) {
    if (bytes.length > 64) {
      throw new Error(`generic hid frame length too long, ${bytes.length}/64`);
    }
    const padding = zeros(64 - bytes.length);
    const buf = [...bytes, ...padding];

    // console.log(`sending ${buf.length} bytes:`);
    // console.log(`sending: ${bytesToHexString(bytes)}`);

    buf.unshift(0); // 先頭に0を付加して送信

    // this.device?.write(buf);
  }

  async writeFrames(frames: number[][]) {
    for (let i = 0; i < frames.length; i++) {
      this.writeSingleFrame(frames[i]);
      // await delayMs(10);
      await delayMs(50); // debug
    }
  }
}
