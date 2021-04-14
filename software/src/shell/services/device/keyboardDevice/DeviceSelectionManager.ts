import {
  compareObjectByJsonStringify,
  IDeviceSelectionStatus,
  IntervalTimerWrapper,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import {
  enumerateSupportedDeviceInfos,
  getDebugDeviceSigFromDevicePath,
  IDeviceSpecificationParams,
} from '~/shell/services/device/keyboardDevice/DeviceEnumerator';
import {
  DeviceWrapper,
  IDeviceWrapper,
} from '~/shell/services/device/keyboardDevice/DeviceWrapper';

const deviceSpecificationParams: IDeviceSpecificationParams[] = [
  // {
  //   vendorId: 0xf055,
  //   productId: 0xa577,
  //   manufacturerString: 'kermite',
  //   productString: 'Kermitie Keyboard Device',
  //   pathSearchWords: [
  //     'mi_00', // Windows
  //     'IOUSBHostInterface@0', // Mac
  //   ],
  // },
  // atmega32u4
  {
    // vendorId: 0xf055,
    // productId: 0xa577,
    serialNumberMcuCode: 'A152FD20',
    usagePage: 0xffab,
    usage: 0x0200,
  },
  // rp2040
  {
    // vendorId: 0xf055,
    // productId: 0xa579,
    serialNumberMcuCode: 'A152FD21',
    usagePage: 0xff00,
    usage: 0x0001,
  },
];

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
          const deviceSig = getDebugDeviceSigFromDevicePath(path);
          if (!device) {
            console.log(`failed to open device: ${deviceSig}`);
            return;
          }
          console.log(`device opened: ${deviceSig}`);
          device.onClosed(() => {
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
