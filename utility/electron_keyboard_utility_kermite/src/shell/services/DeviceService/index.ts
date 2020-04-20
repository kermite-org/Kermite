import { DeviceWrapper } from './DeviceWrapper';
import { Arrays } from '~funcs/Arrays';
import { IRealtimeKeyboardEvent } from '~contract/ipc';

type IRealtimeEventHandlerFunc = (event: IRealtimeKeyboardEvent) => void;

export class DeviceService {
  private handlers: IRealtimeEventHandlerFunc[] = [];
  private deviceWrapper: DeviceWrapper | null = null;

  private emitRealtimeEvent(ev: IRealtimeKeyboardEvent) {
    this.handlers.forEach(h => h(ev));
  }

  private decodeReceivedBytes(buf: Uint8Array) {
    if (buf[0] === 0xf0 && buf[1] === 0x11) {
      const keyNum = buf[2];
      const side = buf[3];
      console.log(`device attrs received`, { keyNum, side });
    }

    if (buf[0] === 0xe0 && buf[1] === 0x90) {
      const keyIndex = buf[2];
      const isDown = buf[3] !== 0;
      this.emitRealtimeEvent({
        type: 'keyStateChanged',
        keyIndex: keyIndex,
        isDown
      });
    }

    if (buf[0] === 0xe0 && buf[1] === 0x91) {
      const layerIndex = buf[2];
      this.emitRealtimeEvent({
        type: 'layerChanged',
        layerIndex
      });
    }
  }

  async initialize(): Promise<void> {
    const dw = new DeviceWrapper();
    const isOpen = dw.open(
      0xf055, //vid
      0xa577, //pid
      [
        //find interface 0 by searching words in device.path
        'mi_00', //Windows
        'IOUSBHostInterface@0' //Mac
      ],
      '74F3AC2E' //serial number fixed part
    );

    // const isOpen = dw.open(0xf055, 0xa57a, 'mi_03');
    if (isOpen) {
      console.log('device opened');
    } else {
      console.log(`failed to open device`);
      return;
    }
    this.deviceWrapper = dw;
    dw.setReceiverFunc(buf => {
      this.decodeReceivedBytes(buf);
    });
  }

  async terminate(): Promise<void> {
    if (this.deviceWrapper) {
      this.deviceWrapper.close();
      this.deviceWrapper = null;
    }
  }

  get IsOpen(): boolean {
    return !!this.deviceWrapper;
  }

  subscribe(proc: (ev: IRealtimeKeyboardEvent) => void) {
    this.handlers.push(proc);
  }

  unsubscribe(proc: (ev: IRealtimeKeyboardEvent) => void) {
    Arrays.remove(this.handlers, proc);
  }
}
