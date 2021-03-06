import {
  compareObjectByJsonStringify,
  IDeviceSelectionStatus,
  IntervalTimerWrapper,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import {
  enumerateSupportedDeviceInfos,
  getDisplayNameFromDevicePath,
  IDeviceSpecificationParams,
} from '~/shell/services/device/KeyboardDevice/DeviceEnumerator';
import {
  DeviceWrapper,
  IDeviceWrapper,
} from '~/shell/services/device/KeyboardDevice/DeviceWrapper';

const deviceSpecificationParams: IDeviceSpecificationParams = {
  vendorId: 0xf055,
  productId: 0xa577,
  pathSearchWords: [
    'mi_00', // Windows
    'IOUSBHostInterface@0', // Mac
  ],
  serialNumberSearchWord: '74F3AC2E', // serial number fixed part
};

export class DeviceSelectionManager {
  private status: IDeviceSelectionStatus = {
    allDeviceInfos: [],
    currentDevicePath: 'none',
  };

  selectionStatusEventPort = createEventPort<Partial<IDeviceSelectionStatus>>({
    initialValueGetter: () => this.status,
  });

  private setStatus(status: Partial<IDeviceSelectionStatus>) {
    this.status = { ...this.status, ...status };
    this.selectionStatusEventPort.emit(status);
  }

  private device: IDeviceWrapper | undefined;

  getDevice() {
    return this.device;
  }

  private closeDevice() {
    if (this.device) {
      this.device.close();
      this.device = undefined;
    }
  }

  selectTargetDevice(path: string) {
    if (path !== this.status.currentDevicePath) {
      this.closeDevice();
      if (path !== 'none') {
        if (this.status.allDeviceInfos.some((info) => info.path === path)) {
          const device = DeviceWrapper.openDeviceByPath(path);
          const displayName = getDisplayNameFromDevicePath(path);
          if (!device) {
            console.log(`failed to open device: ${displayName}`);
            return;
          }
          console.log(`device opened: ${displayName}`);
          device.onClosed(() => {
            this.setStatus({ currentDevicePath: 'none' });
            console.log(`device closed: ${displayName}`);
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
    const initialDevicePath = applicationStorage.readItem<string>(
      'currentDevicePath',
    );
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

  terminate() {
    applicationStorage.writeItem(
      'currentDevicePath',
      this.status.currentDevicePath,
    );
    this.closeDevice();
    this.timerWrapper.stop();
  }
}
