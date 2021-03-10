import {
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
  IRealtimeKeyboardEvent,
  IResourceOrigin,
} from '~/shared';
import { executeWithAppErrorHandler2 } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { getPortNameFromDevicePath } from '~/shell/services/device/KeyboardDevice/DeviceEnumerator';
import {
  deviceSetupTask,
  sendSideBrainHidReport,
  sendSideBrainMode,
  updateDeviceCustomParameterSingle,
} from '~/shell/services/device/KeyboardDevice/DeviceServiceCoreFuncs';
import { recievedBytesDecoder } from '~/shell/services/device/KeyboardDevice/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

async function getProjectInfo(
  origin: IResourceOrigin,
  projectId: string,
): Promise<IProjectResourceInfo | undefined> {
  const resourceInfos = await projectResourceProvider.getAllProjectResourceInfos();
  const info = resourceInfos.find(
    (info) => info.origin === origin && info.projectId === projectId,
  );
  return info;
}

function createConnectedStatus(
  info: IProjectResourceInfo,
  deviceInstanceCode: string,
  assignStorageCapacity: number,
  devicePath: string,
  customParameterValues: number[],
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      origin: info.origin,
      projectId: info.projectId,
      keyboardName: info.keyboardName,
      firmwareBuildRevision: info.firmwareBuildRevision,
      deviceInstanceCode,
      assignStorageCapacity,
      portName: getPortNameFromDevicePath(devicePath) || devicePath,
    },
    customParameterValues,
  };
}

export class KeyboardDeviceServiceCore {
  realtimeEventPort = createEventPort<IRealtimeKeyboardEvent>();

  private device: IDeviceWrapper | undefined;

  private deviceStatus: IKeyboardDeviceStatus = {
    isConnected: false,
  };

  statusEventPort = createEventPort<Partial<IKeyboardDeviceStatus>>({
    initialValueGetter: () => this.deviceStatus,
  });

  private setStatus(newStatus: Partial<IKeyboardDeviceStatus>) {
    this.deviceStatus = { ...this.deviceStatus, ...newStatus };
    this.statusEventPort.emit(newStatus);
  }

  private onDeviceDataReceived = (buf: Uint8Array) => {
    const res = recievedBytesDecoder(buf);
    if (res?.type === 'realtimeEvent') {
      this.realtimeEventPort.emit(res.event);
    }
  };

  private async loadDeviceInfo(device: IDeviceWrapper) {
    const res = await deviceSetupTask(device);
    if (res) {
      const { attrsRes } = res;
      const info = await getProjectInfo(
        attrsRes.resourceOrigin,
        attrsRes.projectId,
      );
      if (info) {
        this.setStatus(
          createConnectedStatus(
            info,
            attrsRes.deviceInstanceCode,
            attrsRes.assignStorageCapacity,
            device.connectedDevicePath!,
            res.customParamsRes.parameterValues,
          ),
        );
      }
    }
  }

  private clearDevice = () => {
    this.setStatus({
      isConnected: false,
      deviceAttrs: undefined,
      customParameterValues: undefined,
    });
    this.device = undefined;
  };

  async setCustomParameterValue(index: number, value: number) {
    if (this.device) {
      const newParameterValues = await updateDeviceCustomParameterSingle(
        this.device,
        index,
        value,
      );
      this.setStatus({
        customParameterValues: newParameterValues,
      });
    }
  }

  setDeivce(device: IDeviceWrapper | undefined) {
    this.clearDevice();
    if (device) {
      device.onData(this.onDeviceDataReceived);
      device.onClosed(this.clearDevice);
      executeWithAppErrorHandler2(() => this.loadDeviceInfo(device));
    }
    this.device = device;
  }

  private isSideBrainMode = false;

  setSideBrainMode(enabled: boolean) {
    this.isSideBrainMode = enabled;
    if (this.device) {
      sendSideBrainMode(this.device, enabled);
    }
  }

  writeSideBrainHidReport(report: number[]) {
    if (this.device && this.isSideBrainMode) {
      sendSideBrainHidReport(this.device, report);
    }
  }
}
