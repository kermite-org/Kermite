import * as HID from 'node-hid';
import { delayMs } from '~/shared';
import { makeListenerPort } from '~/shell/funcs';
import {
  getArrayFromBuffer,
  zeros,
} from '~/shell/services/device/KeyboardDevice/Helpers';

type IReceiverFunc = (buf: Uint8Array) => void;
type IClosedCallback = () => void;

export interface IDeviceWrapper {
  close(): void;
  onClosed(callback: IClosedCallback): void;
  onData(func: IReceiverFunc): void;
  writeSingleFrame(bytes: number[]): Promise<void>;
  writeFrames(frames: number[][]): Promise<void>;
}
export class DeviceWrapper implements IDeviceWrapper {
  private device?: HID.HID | undefined;

  onData = makeListenerPort<Uint8Array>();
  onClosed = makeListenerPort<void>();

  static openDeviceByPath(path: string): DeviceWrapper | undefined {
    const instance = new DeviceWrapper();
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
    device.on('data', this.handleData);
    device.on('error', this.handleError);
    this.device = device;
    return true;
  }

  private handleData = (data: any) => {
    const buf = getArrayFromBuffer(data);
    this.onData.emit(buf);
  };

  private handleError = (error: any) => {
    console.log(`hid device error occured: ${error}`);
    this.close();
  };

  close() {
    if (this.device) {
      this.onClosed.emit();
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
