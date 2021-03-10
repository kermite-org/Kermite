import * as HID from 'node-hid';
import { compareString, IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  vendorId: number;
  productId: number;
  manufacturerString: string;
  productString: string;
  pathSearchWords: string[];
}

interface IEnumeratedDeviceSpec {
  path: string;
  serialNumber: string;
}

export function enumerateSupportedDevicePathsCore(
  params: IDeviceSpecificationParams,
): IEnumeratedDeviceSpec[] {
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
    .filter((info) => !!info.path)
    .map((info) => ({
      path: info.path!,
      serialNumber: info.serialNumber || '',
    }));
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
  const specs = enumerateSupportedDevicePathsCore(params);
  return specs
    .map((spec) => ({
      path: spec.path,
      portName: getPortNameFromDevicePath(spec.path) || spec.path,
      serialNumber: spec.serialNumber,
    }))
    .sort((a, b) => compareString(a.portName, b.portName));
}
