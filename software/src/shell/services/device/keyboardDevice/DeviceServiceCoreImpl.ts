import { IKeyboardDeviceStatus, IRealtimeKeyboardEvent } from '~/shared';
import { executeWithAppErrorHandler2 } from '~/shell/base/ErrorChecker';
import { createEventPort } from '~/shell/funcs';
import { commitCoreState, coreState } from '~/shell/global';
import { getPortNameFromDevicePath } from '~/shell/services/device/keyboardDevice/DeviceEnumerator';
import {
  deviceSetupTask,
  readDeviceCustomParameters,
} from '~/shell/services/device/keyboardDevice/DeviceServiceCoreFuncs';
import { Packets } from '~/shell/services/device/keyboardDevice/Packets';
import {
  ICustomParametersReadResponseData,
  IDeviceAttributesReadResponseData,
  receivedBytesDecoder,
} from '~/shell/services/device/keyboardDevice/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

function createConnectedStatus(
  devicePath: string,
  attrsRes: IDeviceAttributesReadResponseData,
  customParamsRes: ICustomParametersReadResponseData,
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      origin: attrsRes.resourceOrigin,
      firmwareId: attrsRes.firmwareId,
      firmwareVariationName: attrsRes.firmwareVariationName,
      firmwareBuildRevision: attrsRes.projectReleaseBuildRevision,
      deviceInstanceCode: attrsRes.deviceInstanceCode,
      assignStorageCapacity: attrsRes.assignStorageCapacity,
      portName: getPortNameFromDevicePath(devicePath) || devicePath,
      mcuName: attrsRes.firmwareMcuName,
    },
    systemParameterExposedFlags: customParamsRes.parameterExposedFlags,
    systemParameterValues: customParamsRes.parameterValues,
    systemParameterMaxValues: customParamsRes.parameterMaxValues,
  };
}

export class KeyboardDeviceServiceCore {
  realtimeEventPort = createEventPort<IRealtimeKeyboardEvent>();

  private device: IDeviceWrapper | undefined;

  private setStatus(deviceStatus: IKeyboardDeviceStatus) {
    commitCoreState({ deviceStatus });
  }

  private setParameterValues(newParameterValues: number[]) {
    if (coreState.deviceStatus.isConnected) {
      const deviceStatus = {
        ...coreState.deviceStatus,
        parameterValues: newParameterValues,
      };
      commitCoreState({ deviceStatus });
    }
  }

  private onDeviceDataReceived = (buf: Uint8Array) => {
    const res = receivedBytesDecoder(buf);
    if (res?.type === 'realtimeEvent') {
      this.realtimeEventPort.emit(res.event);
    }
    if (res?.type === 'parameterChangedNotification') {
      if (coreState.deviceStatus.isConnected) {
        const newValues = coreState.deviceStatus.systemParameterValues.slice();
        newValues[res.parameterIndex] = res.value;
        this.setParameterValues(newValues);
      }
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
    this.setStatus({ isConnected: false });
    this.device = undefined;
  };

  setCustomParameterValue(index: number, value: number) {
    this.device?.writeSingleFrame(
      Packets.makeCustomParameterSignleWriteOperationFrame(index, value),
    );
  }

  resetParameters() {
    executeWithAppErrorHandler2(async () => {
      if (this.device) {
        this.device.writeSingleFrame(Packets.customParametersResetRequestFrame);
        const customParamsRes = await readDeviceCustomParameters(this.device);
        this.setParameterValues(customParamsRes.parameterValues);
      }
    });
  }

  setDevice(device: IDeviceWrapper | undefined) {
    this.clearDevice();
    if (device) {
      device.onData(this.onDeviceDataReceived);
      device.onClosed(this.clearDevice);
      executeWithAppErrorHandler2(() => this.loadDeviceInfo(device));
    }
    this.device = device;
  }

  setSimulatorMode(enabled: boolean) {
    this.device?.writeSingleFrame(Packets.makeSimulatorModeSpecFrame(enabled));
  }

  writeSimulatorHidReport(report: number[]) {
    if (this.device) {
      if (report.length === 8) {
        console.log(JSON.stringify(report));
        const pk = Packets.makeSimulatorHidReportFrame(report);
        this.device.writeSingleFrame(pk);
      }
    }
  }

  setMuteMode(enabled: boolean) {
    this.device?.writeSingleFrame(Packets.makeMuteModeSpecFrame(enabled));
  }
}
