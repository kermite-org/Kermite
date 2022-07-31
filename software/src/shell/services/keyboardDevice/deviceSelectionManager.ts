import {
  compareObjectByJsonStringify,
  IDeviceSelectionStatus,
  IntervalTimerWrapper,
} from '~/shared';
import { appEnv, applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import { commitCoreState, coreState } from '~/shell/modules/core';
import {
  enumerateSupportedDeviceInfosWebHid,
  IDeviceSpecificationParams,
} from '~/shell/services/keyboardDevice/deviceEnumerator';
import {
  DeviceWrapper,
  IDeviceWrapper,
} from '~/shell/services/keyboardDevice/deviceWrapper';
import { Packets } from '~/shell/services/keyboardDevice/packets';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deviceSpecificationParams: IDeviceSpecificationParams[] = [
  // atmega32u4
  // {
  //   serialNumberFirst12Bytes: 'A152FD2C:M01',
  //   usagePage: 0xffab,
  //   usage: 0x0200,
  // },
  // rp2040
  {
    serialNumberFirst12Bytes: 'A152FD2C:M02',
    usagePage: 0xff00,
    usage: 0x0001,
  },
];

export type IDeviceSelectionManagerEvent = {
  deviceChanged: 1;
};

export class DeviceSelectionManager {
  private device: IDeviceWrapper | undefined;

  eventPort = createEventPort<IDeviceSelectionManagerEvent>();

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

  private async closeDeviceManuallySafely() {
    if (this.device) {
      this.device.writeSingleFrame(Packets.connectionClosingFrame);
      await this.device.close();
    }
  }

  private async openHidDevice(hidDevice: HIDDevice) {
    const deviceName = hidDevice.productName;
    await this.closeDeviceManuallySafely();
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
      // this.updateEnumeration();
      this.setStatus({ currentDevicePath: 'none' });
      console.log(`device closed: ${deviceName}`);
      this.device = undefined;
      this.eventPort.emit({ deviceChanged: 1 });
    });
    this.setStatus({
      currentDevicePath: deviceName,
      lastConnectedDevicePath: deviceName,
    });
    this.device = device;
    this.eventPort.emit({ deviceChanged: 1 });
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
      if (path !== 'none') {
        await this.openPreAuthorizedDeviceByProductName(path);
      } else {
        await this.closeDeviceManuallySafely();
        this.setStatus({ lastConnectedDevicePath: undefined });
      }
    }
  }

  async requestAddNewHidDevice() {
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
    const deviceInfos = await enumerateSupportedDeviceInfosWebHid();
    if (
      !compareObjectByJsonStringify(deviceInfos, this.status.allDeviceInfos)
    ) {
      this.setStatus({ allDeviceInfos: deviceInfos });
      await this.restoreConnectionOnDevicePlugged();
    }
  };

  private async restoreConnectionOnDevicePlugged() {
    const deviceInfos = this.status.allDeviceInfos;
    if (
      !this.device &&
      deviceInfos.length > 0 &&
      this.status.lastConnectedDevicePath
    ) {
      const deviceInfo = deviceInfos.find(
        (it) => it.productName === this.status.lastConnectedDevicePath,
      );
      if (deviceInfo) {
        console.log(`auto reconnect to device: ${deviceInfo.productName}`);
        await this.openPreAuthorizedDeviceByProductName(deviceInfo.productName);
      }
    }
  }

  // private async restoreConnectionOnStart() {
  //   const initialDevicePath =
  //     applicationStorage.readItem<string>('currentDevicePath');
  //   if (initialDevicePath) {
  //     await this.openPreAuthorizedDeviceByProductName(initialDevicePath);
  //   }
  // }

  private handleWebHidDeviceDisconnect = async (e: HIDConnectionEvent) => {
    if (
      this.device &&
      e.device.productName === this.device.keyboardDeviceInfo.productName
    ) {
      await this.device.close();
    }
  };

  private timerWrapper = new IntervalTimerWrapper();

  async initialize() {
    if (!('hid' in navigator)) {
      console.log(`[WARN] WebHID is not supported`);
      return;
    }

    this.status.lastConnectedDevicePath =
      applicationStorage.readItem('lastConnectedDevicePath') || undefined;

    try {
      await this.updateEnumeration();
    } catch (error) {
      if (appEnv.isDevelopment) {
        console.log(`error on WebHID first enumeration`);
        console.log(error);
        return;
      } else {
        throw error;
      }
    }

    // await this.restoreConnectionOnStart();
    this.timerWrapper.start(this.updateEnumeration, 2000);

    navigator.hid.addEventListener(
      'disconnect',
      this.handleWebHidDeviceDisconnect,
    );
  }

  terminate() {
    applicationStorage.writeItem(
      'currentDevicePath',
      this.status.currentDevicePath,
    );
    applicationStorage.writeItem(
      'lastConnectedDevicePath',
      this.status.lastConnectedDevicePath,
    );
    this.timerWrapper.stop();
    // await this.closeDevice();

    navigator.hid.removeEventListener(
      'disconnect',
      this.handleWebHidDeviceDisconnect,
    );
  }

  async disposeConnectedHidDevice() {
    await this.closeDeviceManuallySafely();
  }
}
