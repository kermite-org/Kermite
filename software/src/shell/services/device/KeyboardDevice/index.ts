import {
  IKeyboardDeviceStatus,
  IKeyboardLayoutStandard,
  IProfileData,
  IProjectResourceInfo,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { KeyMappingEmitter } from '~/shell/services/device/KeyboardDevice/KeyMappingEmitter';
import { Packets } from '~/shell/services/device/KeyboardDevice/Packets';
import { recievedBytesDecoder } from '~/shell/services/device/KeyboardDevice/ReceivedBytesDecoder';
import { IKeyboardDeviceServcie } from '~/shell/services/device/KeyboardDevice/interfaces';
import { DeviceWrapper } from './DeviceWrapper';

async function getProjectInfoFromProjectId(
  projectId: string,
): Promise<IProjectResourceInfo | undefined> {
  const resourceInfos = await projectResourceProvider.getAllProjectResourceInfos();
  const info = resourceInfos.find((info) => info.projectId === projectId);
  return info;
}

function createConnectedStatus(
  info: IProjectResourceInfo,
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      projectId: info.projectId,
      keyboardName: info.keyboardName,
    },
  };
}

function openDeviceWrapper(): DeviceWrapper | undefined {
  const deviceWrapper = new DeviceWrapper();
  const isOpen = deviceWrapper.open(
    0xf055, // vid
    0xa577, // pid
    [
      // find interface 0 by searching words in device.path
      'mi_00', // Windows
      'IOUSBHostInterface@0', // Mac
    ],
    '74F3AC2E', // serial number fixed part
  );
  if (!isOpen) {
    console.log(`failed to open device`);
    return undefined;
  }
  console.log('device opened');
  return deviceWrapper;
}

// 接続中のキーボードとRawHIDでやりとりを行うためのブリッジ
export class KeyboardDeviceService implements IKeyboardDeviceServcie {
  realtimeEventPort = createEventPort<IRealtimeKeyboardEvent>();

  private device: DeviceWrapper | undefined;

  private deviceStatus: IKeyboardDeviceStatus = {
    isConnected: false,
  };

  statusEventPort = createEventPort<IKeyboardDeviceStatus>({
    initialValueGetter: () => this.deviceStatus,
  });

  private setStatus(newStatus: IKeyboardDeviceStatus) {
    this.deviceStatus = newStatus;
    this.statusEventPort.emit(newStatus);
  }

  private onDeviceDataReceived = async (buf: Uint8Array) => {
    const res = recievedBytesDecoder(buf);
    if (res?.type === 'deviceAttributeResponse') {
      const info = await getProjectInfoFromProjectId(res.data.projectId);
      if (info) {
        this.setStatus(createConnectedStatus(info));
      }
    }
    if (res?.type === 'realtimeEvent') {
      this.realtimeEventPort.emit(res.event);
    }
  };

  private onDeviceClosed = () => {
    this.setStatus({ isConnected: false, deviceAttrs: undefined });
  };

  initialize() {
    const device = openDeviceWrapper();
    if (device) {
      device.setReceiverFunc(this.onDeviceDataReceived);
      device.onClosed(this.onDeviceClosed);
      device.writeSingleFrame(Packets.deviceAttributesRequestFrame);
      this.device = device;
    }
  }

  terminate() {
    if (this.device) {
      this.device.close();
      this.device = undefined;
    }
  }

  private isSideBrainMode = false;

  setSideBrainMode(enabled: boolean) {
    this.isSideBrainMode = enabled;
    if (this.device) {
      console.log(`writeSideBrainMode ${enabled ? 1 : 0}`);
      if (!enabled) {
        const blankHidReport = [0, 0, 0, 0, 0, 0, 0, 0];
        this.writeSideBrainHidReport(blankHidReport);
      }
      const pk = Packets.makeSideBrainModeSpecFrame(enabled);
      this.device.writeSingleFrame(pk);
    }
  }

  writeSideBrainHidReport(report: number[]) {
    if (this.device && this.isSideBrainMode && report.length === 8) {
      console.log(JSON.stringify(report));
      const pk = Packets.makeSideBrainHidReportFrame(report);
      this.device.writeSingleFrame(pk);
    }
  }

  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent) {
    this.realtimeEventPort.emit(event);
  }

  async emitKeyAssignsToDevice(
    editModel: IProfileData,
    layout: IKeyboardLayoutStandard,
  ): Promise<boolean> {
    return await KeyMappingEmitter.emitKeyAssignsToDevice(
      editModel,
      layout,
      this.device,
    );
  }
}
