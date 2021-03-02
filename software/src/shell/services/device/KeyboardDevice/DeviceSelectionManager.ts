import { IDeviceSelectionStatus } from '~/shared';
import { createEventPort } from '~/shell/funcs';
import {
  enumerateSupportedDeviceInfos,
  IDeviceSpecificationParams,
} from '~/shell/services/device/KeyboardDevice/DeviceEnumerator';
import {
  DeviceWrapper2,
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

  private openDevice(path: string) {
    if (path !== 'none') {
      const device = DeviceWrapper2.openDeviceByPath(path);
      if (device) {
        device.onClosed(() => this.setStatus({ currentDevicePath: 'none' }));
        this.device = device;
        this.setStatus({ currentDevicePath: path });
      } else {
        this.setStatus({ currentDevicePath: 'none' });
      }
    }
  }

  private closeDevice() {
    if (this.device) {
      this.device.close();
      this.device = undefined;
      // this.setStatus({ currentDevicePath: 'none' }
    }
  }

  selectTargetDevice(path: string): IDeviceWrapper | undefined {
    if (path !== this.status.currentDevicePath) {
      this.closeDevice();
      this.openDevice(path);
    }
    return this.device;
  }

  initialize() {
    const infos = enumerateSupportedDeviceInfos(deviceSpecificationParams);
    console.log({ infos });
    this.setStatus({ allDeviceInfos: infos });
  }

  terminate() {}
}
