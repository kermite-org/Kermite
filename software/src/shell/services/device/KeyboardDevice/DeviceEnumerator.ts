import * as HID from 'node-hid';
import { IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  vendorId: number;
  productId: number;
  pathSearchWords: string[];
  serialNumberSearchWord: string;
}

export function enumerateSupportedDevicePathsCore(
  params: IDeviceSpecificationParams,
): string[] {
  const {
    vendorId,
    productId,
    pathSearchWords,
    serialNumberSearchWord,
  } = params;
  const allDeviceInfos = HID.devices();
  // console.log(allDeviceInfos);
  return allDeviceInfos
    .filter(
      (d) =>
        d.vendorId === vendorId &&
        d.productId === productId &&
        pathSearchWords.some((word) => d.path!.includes(word)) &&
        d.serialNumber?.includes(serialNumberSearchWord),
    )
    .map((info) => info.path!)
    .filter((it) => !!it);
}

function getDisplayNameFromDevicePath(path: string) {
  const m = path.match(/kermite_core_atmega32u4@(\d+)/);
  return m ? `device@${m[1]}` : path;
}

export function enumerateSupportedDeviceInfos(
  params: IDeviceSpecificationParams,
): IKeyboardDeviceInfo[] {
  return enumerateSupportedDevicePathsCore(params).map((path) => ({
    path,
    displayName: getDisplayNameFromDevicePath(path),
  }));
}
