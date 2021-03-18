import * as HID from 'node-hid';
import { compareString, IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  vendorId: number;
  productId: number;
  serialNumberMcuCode: string;
  usagePage: number;
  usage: number;
}

interface IEnumeratedDeviceSpec {
  path: string;
  serialNumber: string;
}

export function enumerateSupportedDevicePathsCore(
  params: IDeviceSpecificationParams[],
): IEnumeratedDeviceSpec[] {
  const allDeviceInfos = HID.devices();
  // console.log(allDeviceInfos);
  return allDeviceInfos
    .filter((d) =>
      params.some(
        (param) =>
          d.vendorId === param.vendorId &&
          d.productId === param.productId &&
          d.serialNumber?.slice(0, 8) === param.serialNumberMcuCode &&
          d.usagePage === param.usagePage &&
          d.usage === param.usage,
      ),
    )
    .filter((info) => !!info.path)
    .map((info) => ({
      path: info.path!,
      serialNumber: info.serialNumber || '',
    }));
}

export function getPortNameFromDevicePath(path: string) {
  const m =
    path.match(/Kermite Keyboard Device@(\d+)/) || // Mac
    path.match(/mi_00#8&([0-9a-f]+)/); // Windows
  return (m && `${m[1]}`) || undefined;
}

export function getDebugDeviceSigFromDevicePath(path: string) {
  const portName = getPortNameFromDevicePath(path);
  return portName ? `device@${portName}` : path;
}

function makeKeyboardDeviceInfoFromDeviceSpec(
  spec: IEnumeratedDeviceSpec,
  index: number,
): IKeyboardDeviceInfo {
  const { path, serialNumber } = spec;
  const portName = getPortNameFromDevicePath(path) || index.toString();
  const projectId = serialNumber.slice(0, 8);
  const deviceInstanceCode = serialNumber.slice(8, 16);
  return {
    path,
    portName,
    projectId,
    deviceInstanceCode,
  };
}

export function enumerateSupportedDeviceInfos(
  params: IDeviceSpecificationParams[],
): IKeyboardDeviceInfo[] {
  const specs = enumerateSupportedDevicePathsCore(params);
  return specs
    .sort((a, b) => compareString(a.path, b.path))
    .map(makeKeyboardDeviceInfoFromDeviceSpec);
}
