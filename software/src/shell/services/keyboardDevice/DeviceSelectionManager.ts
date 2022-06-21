import {
  compareObjectByJsonStringify,
  IDeviceSelectionStatus,
  IntervalTimerWrapper,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { commitCoreState, coreState } from '~/shell/modules/core';
import {
  enumerateSupportedDeviceInfosWebHid,
  IDeviceSpecificationParams,
} from '~/shell/services/keyboardDevice/DeviceEnumerator';
import {
  DeviceWrapper,
  IDeviceWrapper,
} from '~/shell/services/keyboardDevice/DeviceWrapper';
import { Packets } from '~/shell/services/keyboardDevice/Packets';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  private async openHidDevice(hidDevice: HIDDevice) {
    const deviceName = hidDevice.productName;
    this.closeDevice();
    const device = await DeviceWrapper.openWebHidDevice(hidDevice);
    if (!device) {
      console.log(`failed to open device: ${deviceName}`);
      return;
    }
    const na = 'N/A';
    device.setKeyboardDeviceInfo({
      path: na,
      portName: na,
      mcuCode: na,
      firmwareId: na,
      projectId: na,
      variationId: na,
      deviceInstanceCode: na,
      productName: hidDevice.productName,
      manufacturerName: na,
    });
    device.writeSingleFrame(Packets.connectionOpenedFrame);
    device.writeSingleFrame(
      Packets.makeSimulatorModeSpecFrame(
        coreState.keyboardConfig.isSimulatorMode,
      ),
    );
    console.log(`device opened: ${deviceName}`);
    device.onClosed(() => {
      this.updateEnumeration();
      this.setStatus({ currentDevicePath: 'none' });
      console.log(`device closed: ${deviceName}`);
    });
    this.setStatus({ currentDevicePath: deviceName });
    this.device = device;
  }

  private async openPreAuthorizedDeviceByProductName(productName: string) {
    const hidDevices = await navigator.hid.getDevices();
    const hidDevice = hidDevices.find(
      (d) => d.collections.length > 0 && d.productName === productName,
    );
    if (hidDevice) {
      await this.openHidDevice(hidDevice);
    }
  }

  async selectTargetDevice(path: string) {
    if (path !== this.status.currentDevicePath) {
      this.closeDevice();
      if (path !== 'none') {
        await this.openPreAuthorizedDeviceByProductName(path);
      }
    }
  }

  async selectHidDevice() {
    const hidDevices = await navigator.hid.requestDevice({
      filters: [
        // {
        //   vendorId: 0xf055,
        //   productId: 0xa577,
        //   usagePage: 0xffab,
        //   usage: 0x0200,
        // },
        {
          vendorId: 0xf055,
          productId: 0xa579,
          usagePage: 0xff00,
          usage: 0x0001,
        },
      ],
    });
    // console.log({ hidDevices });
    const hidDevice = hidDevices.find((d) => d.collections.length > 0);
    if (hidDevice) {
      await this.openHidDevice(hidDevice);
    }
  }

  private updateEnumeration = async () => {
    const infos = await enumerateSupportedDeviceInfosWebHid();
    if (!compareObjectByJsonStringify(infos, this.status.allDeviceInfos)) {
      this.setStatus({ allDeviceInfos: infos });
    }
  };

  private async restoreConnection() {
    const initialDevicePath =
      applicationStorage.readItem<string>('currentDevicePath');
    if (initialDevicePath) {
      await this.openPreAuthorizedDeviceByProductName(initialDevicePath);
    }
  }

  private timerWrapper = new IntervalTimerWrapper();

  async initialize() {
    this.updateEnumeration();
    await this.restoreConnection();
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
