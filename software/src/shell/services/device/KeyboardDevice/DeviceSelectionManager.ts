import { IDeviceSelectionStatus } from '~/shared';
import { createEventPort } from '~/shell/funcs';
import {
  enumerateSupportedDeviceInfos,
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

  private openDevice(path: string) {
    const device = DeviceWrapper.openDeviceByPath(path);
    if (!device) {
      console.log(`failed to open device`);
      return;
    }
    console.log(`device opened`);
    device.onClosed(this.onDeviceClosed);
    this.setStatus({ currentDevicePath: path });
    this.device = device;
  }

  private onDeviceClosed = () => {
    this.setStatus({ currentDevicePath: 'none' });
    console.log(`device closed`);
  };

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
        this.openDevice(path);
      }
    }
  }

  initialize() {
    const infos = enumerateSupportedDeviceInfos(deviceSpecificationParams);
    this.setStatus({ allDeviceInfos: infos });
  }

  terminate() {
    this.closeDevice();
  }
}
