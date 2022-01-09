import {
  compareObjectByJsonStringify,
  IDeviceSelectionStatus,
  IntervalTimerWrapper,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { commitCoreState, coreState } from '~/shell/modules/core';
import {
  enumerateSupportedDeviceInfos,
  IDeviceSpecificationParams,
} from '~/shell/services/keyboardDevice/DeviceEnumerator';
import {
  DeviceWrapper,
  IDeviceWrapper,
} from '~/shell/services/keyboardDevice/DeviceWrapper';
import { Packets } from '~/shell/services/keyboardDevice/Packets';

const deviceSpecificationParams: IDeviceSpecificationParams[] = [
  // atmega32u4
  {
    serialNumberFirst12Bytes: 'A152FD2C:M01',
    usagePage: 0xffab,
    usage: 0x0200,
  },
  // rp2040
  {
    serialNumberFirst12Bytes: 'A152FD2C:M02',
    usagePage: 0xff00,
    usage: 0x0001,
  },
];

export class DeviceSelectionManager {
  private device: IDeviceWrapper | undefined;

  getDevice() {
    return this.device;
  }

  private get status() {
    return coreState.deviceSelectionStatus;
  }

  private setStatus(status: Partial<IDeviceSelectionStatus>) {
    const deviceSelectionStatus = {
      ...coreState.deviceSelectionStatus,
      ...status,
    };
    commitCoreState({ deviceSelectionStatus });
  }

  private closeDevice() {
    if (this.device) {
      this.device.writeSingleFrame(Packets.connectionClosingFrame);
      this.device.close();
      this.device = undefined;
    }
  }

  selectTargetDevice(path: string) {
    if (path !== this.status.currentDevicePath) {
      this.closeDevice();
      if (path !== 'none') {
        const targetDeviceInfo = this.status.allDeviceInfos.find(
          (info) => info.path === path,
        );
        if (targetDeviceInfo) {
          const deviceSig = targetDeviceInfo.portName;
          const device = DeviceWrapper.openDeviceByPath(path);
          if (!device) {
            console.log(`failed to open device: ${deviceSig}`);
            return;
          }
          device.setKeyboardDeviceInfo(targetDeviceInfo);
          device.writeSingleFrame(Packets.connectionOpenedFrame);
          device.writeSingleFrame(
            Packets.makeSimulatorModeSpecFrame(
              coreState.keyboardConfig.isSimulatorMode,
            ),
          );
          console.log(`device opened: ${deviceSig}`);
          device.onClosed(() => {
            this.updateEnumeration();
            this.setStatus({ currentDevicePath: 'none' });
            console.log(`device closed: ${deviceSig}`);
          });
          this.setStatus({ currentDevicePath: path });
          this.device = device;
        }
      }
    }
  }

  private updateEnumeration = () => {
    const infos = enumerateSupportedDeviceInfos(deviceSpecificationParams);
    if (!compareObjectByJsonStringify(infos, this.status.allDeviceInfos)) {
      this.setStatus({ allDeviceInfos: infos });
    }
  };

  private restoreConnection() {
    const initialDevicePath =
      applicationStorage.readItem<string>('currentDevicePath');
    if (initialDevicePath) {
      this.selectTargetDevice(initialDevicePath);
    }
  }

  private timerWrapper = new IntervalTimerWrapper();

  initialize() {
    this.updateEnumeration();
    this.restoreConnection();
    this.timerWrapper.start(this.updateEnumeration, 2000);
  }

  disposeConnectedHidDevice() {
    this.closeDevice();
  }

  terminate() {
    applicationStorage.writeItem(
      'currentDevicePath',
      this.status.currentDevicePath,
    );
    this.closeDevice();
    this.timerWrapper.stop();
  }
}
