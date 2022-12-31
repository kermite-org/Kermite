import { appUi } from '~/app-shared';

function isDeviceRawHidInterface(device: HIDDevice) {
  return device.collections.some(
    (col) => col.usagePage === 0xff00 && col.usage === 0x01,
  );
}

type IDeviceWrapper = {
  hidDevice: HIDDevice;
  close(): Promise<void>;
};

async function hidDeviceOpener_getAuthorizedDeviceByProductName(
  productName: string,
) {
  const hidDevices = (await navigator.hid.getDevices()).filter(
    isDeviceRawHidInterface,
  );
  const hidDevice = hidDevices.find((it) => it.productName === productName);
  return hidDevice;
}

async function hidDeviceOpener_selectNewDevice() {
  const hidDevices = (
    await navigator.hid.requestDevice({
      filters: [{ vendorId: 0xf055, productId: 0xa579 }],
    })
  ).filter(isDeviceRawHidInterface);
  const hidDevice = hidDevices[0];
  return hidDevice;
}

function createDeviceWrapper(hidDevice: HIDDevice): IDeviceWrapper {
  return {
    hidDevice,
    async close() {
      await hidDevice.close();
    },
  };
}

function createDeviceStore() {
  const state = {
    targetDeviceProductName: undefined as string | undefined,
    currentDevice: undefined as IDeviceWrapper | undefined,
  };

  const readers = {
    get currentDeviceProductName() {
      return state.currentDevice?.hidDevice.productName;
    },
  };

  const internalActions = {
    openHidDevice(hidDevice: HIDDevice) {
      const device = createDeviceWrapper(hidDevice);
      if (device) {
        state.currentDevice = device;
        state.targetDeviceProductName = device.hidDevice.productName;
        appUi.rerender();
      }
    },
  };

  const actions = {
    async restoreConnection() {
      const productName = state.targetDeviceProductName;
      if (productName) {
        const hidDevice =
          await hidDeviceOpener_getAuthorizedDeviceByProductName(productName);
        if (hidDevice) {
          internalActions.openHidDevice(hidDevice);
        }
      }
    },
    async openNewDevice() {
      const hidDevice = await hidDeviceOpener_selectNewDevice();
      internalActions.openHidDevice(hidDevice);
    },
    async closeDevice() {
      const device = state.currentDevice;
      if (device) {
        await device.close();
        state.currentDevice = undefined;
        state.targetDeviceProductName = undefined;
        appUi.rerender();
      }
    },
  };

  return { state, readers, actions };
}

export const deviceStore = createDeviceStore();
