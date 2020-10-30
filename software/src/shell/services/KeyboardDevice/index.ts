import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import {
  ConfigStorageFormatRevision,
  RawHidMessageProtocolRevision
} from '~defs/Versions';
import { StatusSource } from '~funcs/StatusSource';
import { removeArrayItems } from '~funcs/Utils';
import { DeviceWrapper } from './DeviceWrapper';

type IRealtimeEventListenerFunc = (event: IRealtimeKeyboardEvent) => void;

function bytesToString(bytes: number[]) {
  return bytes.reduce((str, chr) => str + String.fromCharCode(chr), '');
}
// 接続中のキーボードとRawHIDでやりとりを行うためのブリッジ
export class KeyboardDeviceService {
  private listeners: IRealtimeEventListenerFunc[] = [];
  private deviceWrapper: DeviceWrapper | null = null;

  deviceStatus = new StatusSource<{ isConnected: boolean }>({
    isConnected: false
  });

  private emitRealtimeEvent(ev: IRealtimeKeyboardEvent) {
    this.listeners.forEach((h) => h(ev));
  }

  private decodeReceivedBytes(buf: Uint8Array) {
    if (buf[0] === 0xf0 && buf[1] === 0x11) {
      const firmwareReleaseBuildRevision = (buf[2] << 8) | buf[3];
      const firmwareConfigStorageRevision = buf[4];
      const firmwareMessageProtocolRevision = buf[5];
      const keyIndexRange = buf[6];
      const side = buf[7];
      const projectId = bytesToString([...buf].slice(8, 16));
      console.log(`device attrs received`, {
        firmwareReleaseBuildRevision,
        firmwareConfigStorageRevision,
        firmwareMessageProtocolRevision,
        keyIndexRange,
        side,
        projectId
      });
      if (firmwareConfigStorageRevision !== ConfigStorageFormatRevision) {
        console.log(
          `incompatible config storage revision (software:${ConfigStorageFormatRevision} firmware:${firmwareConfigStorageRevision})`
        );
      }
      if (firmwareMessageProtocolRevision !== RawHidMessageProtocolRevision) {
        console.log(
          `incompatible message protocol revision (software:${RawHidMessageProtocolRevision} firmware:${firmwareMessageProtocolRevision})`
        );
      }
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
      const layerActiveFlags = (buf[2] << 8) | buf[3];
      this.emitRealtimeEvent({
        type: 'layerChanged',
        layerActiveFlags
      });
    }

    if (buf[0] === 0xe0 && buf[1] === 0x92) {
      const assignHitResultWord = (buf[2] << 8) | buf[3];
      const keyIndex = assignHitResultWord & 0xff;
      const layerIndex = (assignHitResultWord >> 8) & 0x0f;
      const prioritySpec = (assignHitResultWord >> 12) & 0x03;
      // console.log(`assign hit @ device ${keyIndex} ${layerIndex}`);
      this.emitRealtimeEvent({
        type: 'assignHit',
        layerIndex,
        keyIndex,
        prioritySpec
      });
    }
  }

  async initialize(): Promise<void> {
    const dw = new DeviceWrapper();
    const isOpen = dw.open(
      0xf055, // vid
      0xa577, // pid
      [
        // find interface 0 by searching words in device.path
        'mi_00', // Windows
        'IOUSBHostInterface@0' // Mac
      ],
      '74F3AC2E' // serial number fixed part
    );

    // const isOpen = dw.open(0xf055, 0xa57a, 'mi_03');
    if (isOpen) {
      console.log('device opened');
      this.deviceStatus.set({ isConnected: true });
    } else {
      console.log(`failed to open device`);
      return;
    }
    this.deviceWrapper = dw;
    dw.setReceiverFunc((buf) => {
      this.decodeReceivedBytes(buf);
    });
    dw.onClosed(() => {
      this.deviceStatus.set({ isConnected: false });
    });

    dw.writeSingleFrame([0xf0, 0x10]); // device attributes request
  }

  async terminate(): Promise<void> {
    if (this.deviceWrapper) {
      this.deviceWrapper.close();
      this.deviceWrapper = null;
    }
  }

  get isOpen(): boolean {
    return !!this.deviceWrapper;
  }

  subscribe(proc: IRealtimeEventListenerFunc) {
    this.listeners.push(proc);
  }

  unsubscribe(proc: IRealtimeEventListenerFunc) {
    removeArrayItems(this.listeners, proc);
  }

  private isSideBrainMode = false;

  setSideBrainMode(enabled: boolean) {
    console.log(`writeSideBrainMode ${enabled ? 1 : 0}`);
    if (!enabled) {
      this.writeSideBrainHidReport([0, 0, 0, 0, 0, 0, 0, 0]);
    }
    const buf = [0xd0, 0x10, enabled ? 1 : 0];
    this.deviceWrapper?.writeSingleFrame(buf);
    this.isSideBrainMode = enabled;
  }

  writeSideBrainHidReport(report: number[]) {
    // report must be 8bytes
    if (report.length !== 8) {
      return;
    }
    if (!this.isSideBrainMode) {
      return;
    }
    console.log(JSON.stringify(report));
    const buf = [0xd0, 0x20, ...report];
    this.deviceWrapper?.writeSingleFrame(buf);
  }

  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent) {
    this.emitRealtimeEvent(event);
  }

  writeSingleFrame(bytes: number[]) {
    this.deviceWrapper?.writeSingleFrame(bytes);
  }

  async writeFrames(frames: number[][]) {
    await this.deviceWrapper?.writeFrames(frames);
  }
}
export const deviceService = new KeyboardDeviceService();
