import { IKeyboardDeviceStatus, IRealtimeKeyboardEvent } from '~/shared';
import { executeWithAppErrorHandler2 } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { getPortNameFromDevicePath } from '~/shell/services/device/keyboardDevice/DeviceEnumerator';
import {
  deviceSetupTask,
  sendMuteMode,
  sendSimulatorHidReport,
  sendSimulatorMode,
  updateDeviceCustomParameterSingle,
} from '~/shell/services/device/keyboardDevice/DeviceServiceCoreFuncs';
import {
  ICustomParametersReadResponseData,
  IDeviceAttributesReadResponseData,
  recievedBytesDecoder,
} from '~/shell/services/device/keyboardDevice/ReceivedBytesDecoder';
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
    systemParameterValues: custromParamsRes?.parameterValues,
    systemParameterMaxValues: custromParamsRes?.parameterMaxValues,
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
    if (res?.type === 'parameterChangedNotification') {
      const newValues = this.deviceStatus.systemParameterValues!.slice();
      newValues[res.parameterIndex] = res.value;
      this.setStatus({
        systemParameterValues: newValues,
      });
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
      systemParameterValues: undefined,
      systemParameterMaxValues: undefined,
    });
    this.device = undefined;
  };

  setCustomParameterValue(index: number, value: number) {
    if (this.device) {
      updateDeviceCustomParameterSingle(this.device, index, value);
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

  private isSimulatorMode = false;

  setSimulatorMode(enabled: boolean) {
    this.isSimulatorMode = enabled;
    if (this.device) {
      sendSimulatorMode(this.device, enabled);
    }
  }

  writeSimulatorHidReport(report: number[]) {
    if (this.device && this.isSimulatorMode) {
      sendSimulatorHidReport(this.device, report);
    }
  }

  setMuteMode(enabled: boolean) {
    if (this.device) {
      sendMuteMode(this.device, enabled);
    }
  }
}
