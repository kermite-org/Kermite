import * as HID from 'node-hid';
import { compareString, IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  vendorId: number;
  productId: number;
  manufacturerString: string;
  productString: string;
  pathSearchWords: string[];
}

export function enumerateSupportedDevicePathsCore(
  params: IDeviceSpecificationParams,
): string[] {
  const {
    vendorId,
    productId,
    manufacturerString,
    productString,
    pathSearchWords,
  } = params;
  const allDeviceInfos = HID.devices();
  // console.log(allDeviceInfos);
  return allDeviceInfos
    .filter(
      (d) =>
        d.vendorId === vendorId &&
        d.productId === productId &&
        d.manufacturer === manufacturerString &&
        d.product === productString &&
        pathSearchWords.some((word) => d.path!.includes(word)),
    )
    .map((info) => info.path!)
    .filter((it) => !!it);
}

export function getPortNameFromDevicePath(path: string) {
  const m =
    path.match(/kermite_core_atmega32u4@(\d+)/) || // Mac
    path.match(/mi_00#8&([0-9a-f]+)/); // Windows
  return (m && `${m[1]}`) || undefined;
}

export function getDisplayNameFromDevicePath(path: string) {
  const portName = getPortNameFromDevicePath(path);
  return portName ? `device@${portName}` : path;
}

export function enumerateSupportedDeviceInfos(
  params: IDeviceSpecificationParams,
): IKeyboardDeviceInfo[] {
  return enumerateSupportedDevicePathsCore(params)
    .map((path) => ({
      path,
      displayName: getDisplayNameFromDevicePath(path),
    }))
    .sort((a, b) => compareString(a.displayName, b.displayName));
}
