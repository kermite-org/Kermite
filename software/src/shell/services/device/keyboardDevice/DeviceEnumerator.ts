import * as HID from 'node-hid';
import { compareString, IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  serialNumberFirst10Bytes: string;
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
  return allDeviceInfos
    .filter((d) =>
      params.some(
        (param) =>
          d.serialNumber?.slice(0, 10) === param.serialNumberFirst10Bytes &&
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
    path.match(/AppleUSB20HubPort@(\d+)/) || // Mac
    path.match(/mi_\d+#8&([0-9a-f]+)/); // Windows
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
  const firmwareId = serialNumber.slice(10, 16);
  const deviceInstanceCode = serialNumber.slice(16, 24);
  return {
    path,
    portName,
    firmwareId,
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
