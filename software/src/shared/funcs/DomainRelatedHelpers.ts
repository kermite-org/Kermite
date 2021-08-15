import {
  IBootloaderType,
  IFirmwareTargetDevice,
  IKeyboardDeviceAttributes,
  IPresetSpec,
  IPresetType,
  IResourceOrigin,
  IStandardBaseFirmwareType,
} from '~/shared/defs';
import { generateNumberSequence } from '~/shared/funcs/Utils';

// プロジェクトソースの単一文字列表現 `local#${projectId}` or `online#${projectId}`
export function createProjectSig(origin: IResourceOrigin, projectId: string) {
  return `${origin}#${projectId}`;
}

export function getProjectOriginAndIdFromSig(
  projectSig: string,
): { origin: IResourceOrigin; projectId: string } {
  const [origin, projectId] = projectSig.split('#');
  return { origin: origin as IResourceOrigin, projectId };
}

// プリセットソースの単一文字列表現 `blank:${layoutName}` or `preset:${presetName}`
export function createPresetKey(type: IPresetType, name: string) {
  return `${type}:${name}`;
}

export function getPresetSpecFromPresetKey(presetKey: string): IPresetSpec {
  const [_type, name] = presetKey.split(':');
  const type = _type as IPresetType;
  if (type === 'blank') {
    return { type, layoutName: name };
  } else {
    return { type, presetName: name };
  }
}

export function generateNextSequentialId(
  prefix: string,
  existingsIds: string[],
): string {
  const allNumbers = existingsIds.map((it) => parseInt(it.replace(prefix, '')));
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  return `${prefix}${newNumber}`;
}

export function generateRandomDeviceInstanceCode(): string {
  return generateNumberSequence(8)
    .map((_) => ((Math.random() * 16) >> 0).toString(16))
    .join('');
}

export function checkDeviceInstanceCodeValid(code: string): boolean {
  if (code === '00000000') {
    return false;
  }
  return /^[0-9a-f]{8}$/.test(code);
}

const kermiteMcuCodeToMcuNameMap: { [key in string]: string } = {
  A152FD2C01: 'ATmega32U4',
  A152FD2C02: 'RP2040',
};
export function getMcuNameFromKermiteMcuCode(code: string) {
  return kermiteMcuCodeToMcuNameMap[code] || 'unknown';
}

export function getProjectKeyFromDeviceAttributes(
  deviceAttrs: IKeyboardDeviceAttributes,
): string {
  return `${deviceAttrs.origin}#${deviceAttrs.firmwareId}`;
}

export function splitProjectProfileName(
  profileName: string,
): { folderPart: string; filePart: string } {
  const [folderPart, filePart] = profileName.split('/');
  return { folderPart, filePart };
}

export function joinProjectProfileName(
  folderPart: string,
  filePart: string,
): string {
  return `${folderPart}/${filePart}`;
}

export function checkDeviceBootloaderMatch(
  bootloaderType: IBootloaderType,
  firmwareTargetDevice: IFirmwareTargetDevice,
): boolean {
  const isBootloaderAvr =
    bootloaderType === 'avrCaterina' || bootloaderType === 'avrDfu';
  const isBootloaderRp2040 = bootloaderType === 'rp2040uf2';
  return (
    (isBootloaderAvr && firmwareTargetDevice === 'atmega32u4') ||
    (isBootloaderRp2040 && firmwareTargetDevice === 'rp2040')
  );
}

export function getFirmwareTargetDeviceFromBaseFirmwareType(
  baseFirmwareType: IStandardBaseFirmwareType,
): IFirmwareTargetDevice {
  if (baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit') {
    return 'atmega32u4';
  } else {
    return 'rp2040';
  }
}
