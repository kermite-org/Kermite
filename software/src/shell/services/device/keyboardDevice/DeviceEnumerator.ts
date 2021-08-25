import * as HID from 'node-hid';
import { compareString, IKeyboardDeviceInfo } from '~/shared';

export interface IDeviceSpecificationParams {
  serialNumberFirst12Bytes: string;
  usagePage: number;
  usage: number;
}

interface IEnumeratedDeviceSpec {
  path: string;
  serialNumber: string;
  productName: string;
  manufacturerName: string;
}

export function enumerateSupportedDevicePathsCore(
  params: IDeviceSpecificationParams[],
): IEnumeratedDeviceSpec[] {
  const allDeviceInfos = HID.devices();
  return allDeviceInfos
    .filter((d) =>
      params.some(
        (param) =>
          d.serialNumber?.slice(0, 12) === param.serialNumberFirst12Bytes &&
          d.usagePage === param.usagePage &&
          d.usage === param.usage,
      ),
    )
    .filter((info) => !!info.path)
    .map((info) => ({
      path: info.path!,
      serialNumber: info.serialNumber || '',
      productName: info.product || '',
      manufacturerName: info.manufacturer || '',
    }));
}

export function getPortNameFromDevicePath(path: string) {
  const m =
    path.match(/AppleUSB20HubPort@(\d+)/) || // Mac
    path.match(/mi_\d+#8&([0-9a-f]+)/); // Windows
  return (m && `${m[1]}`) || undefined;
}

function makeKeyboardDeviceInfoFromDeviceSpec(
  spec: IEnumeratedDeviceSpec,
  index: number,
): IKeyboardDeviceInfo {
  const { path, serialNumber, productName, manufacturerName } = spec;
  const portName = getPortNameFromDevicePath(path) || index.toString();
  const [
    ,
    mcuCode,
    firmwareId,
    projectId,
    variationId,
    deviceInstanceCode,
  ] = serialNumber.split(':');
  return {
    path,
    portName,
    mcuCode,
    firmwareId,
    projectId,
    variationId,
    productName,
    deviceInstanceCode,
    manufacturerName,
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
