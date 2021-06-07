/* eslint-disable @typescript-eslint/no-unused-vars */
import * as usb from 'usb';
import { DfuRequestType } from '~/shell/services/firmwareUpdation/flashSchemeAtmegaDfu/DfuConstants';

const isWindows = process.platform === 'win32';

function usbPromisify<A extends any[], D>(
  func: (...args: [...A, (err: any, data: D) => void]) => void,
): (...args: A) => Promise<D> {
  return (...args: A) => {
    return new Promise((resolve, reject) => {
      func(...args, (err: any, data: D) => {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
}

export interface IDfuDeviceFunctionWrapper {
  getDeviceDetail(): Promise<{
    manufacturer: string | undefined;
    product: string | undefined;
  }>;
  requestRead(
    bRequest: number,
    wValue: number,
    wIndex: number,
    length: number,
  ): Promise<number[]>;
  requestWrite(
    bRequest: number,
    wValue: number,
    wIndex: number,
    data: number[],
  ): Promise<void>;
}

export function createDfuDeviceFunctionWrapper(
  device: usb.Device,
): IDfuDeviceFunctionWrapper {
  const asyncGetStringDescriptor = usbPromisify(
    device.getStringDescriptor.bind(device),
  );

  const asyncControlTransfter = usbPromisify(
    device.controlTransfer.bind(device),
  );

  async function getDeviceDetail() {
    const manufacturer = await asyncGetStringDescriptor(
      device.deviceDescriptor.iManufacturer,
    );
    const product = await asyncGetStringDescriptor(
      device.deviceDescriptor.iProduct,
    );
    return {
      manufacturer,
      product,
    };
  }

  async function requestRead(
    bRequest: number,
    wValue: number,
    wIndex: number,
    length: number,
  ): Promise<number[]> {
    // console.log(`requestRead ${bRequest} ${wValue} ${length}`);
    const buffer = (await asyncControlTransfter(
      DfuRequestType.Receive,
      bRequest,
      wValue,
      wIndex,
      length,
    ))!;
    // console.log(" ", { bufferReceived: buffer });
    return [...new Uint8Array(buffer)];
  }

  async function requestWrite(
    bRequest: number,
    wValue: number,
    wIndex: number,
    data: number[],
  ): Promise<void> {
    // console.log(`requestWrite ${bRequest} ${wValue}`);
    let modData = data;
    if (isWindows) {
      // Windowsで空のBufferをnode-usbに渡すとlibusbの内部で例外が出るためこれを回避
      modData = data.length === 0 ? [0] : data;
    }
    const dataSend = Buffer.from(modData);
    // console.log(" ", { dataSend });
    await asyncControlTransfter(
      DfuRequestType.Send,
      bRequest,
      wValue,
      wIndex,
      dataSend,
    );
  }

  return {
    getDeviceDetail,
    requestRead,
    requestWrite,
  };
}
