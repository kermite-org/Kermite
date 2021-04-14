import { IKeyboardDeviceStatus, IRealtimeKeyboardEvent } from '~/shared';
import { executeWithAppErrorHandler2 } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { getPortNameFromDevicePath } from '~/shell/services/device/keyboardDevice_/DeviceEnumerator';
import {
  deviceSetupTask,
  sendSideBrainHidReport,
  sendSideBrainMode,
  updateDeviceCustomParameterSingle,
} from '~/shell/services/device/keyboardDevice_/DeviceServiceCoreFuncs';
import {
  ICustomParametersReadResponseData,
  IDeviceAttributesReadResponseData,
  recievedBytesDecoder,
} from '~/shell/services/device/keyboardDevice_/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

function createConnectedStatus(
  devicePath: string,
  attrsRes: IDeviceAttributesReadResponseData,
  custromParamsRes: ICustomParametersReadResponseData | undefined,
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      origin: attrsRes.resourceOrigin,
      projectId: attrsRes.projectId,
      firmwareVariationName: attrsRes.firmwareVariationName,
      firmwareBuildRevision: attrsRes.projectReleaseBuildRevision,
      deviceInstanceCode: attrsRes.deviceInstanceCode,
      assignStorageCapacity: attrsRes.assignStorageCapacity,
      portName: getPortNameFromDevicePath(devicePath) || devicePath,
      mcuName: attrsRes.firmwareMcuName,
    },
    customParameterValues: custromParamsRes?.parameterValues,
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
    const setupRes = await deviceSetupTask(device);
    // console.log({ res: setupRes });
    if (setupRes) {
      this.setStatus(
        createConnectedStatus(
          device.connectedDevicePath!,
          setupRes.attrsRes,
          setupRes.customParamsRes,
        ),
      );
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
