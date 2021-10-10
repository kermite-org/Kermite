import {
  IBootloaderType,
  IFirmwareTargetDevice,
  IKeyboardDeviceAttributes,
  IPresetSpec,
  IPresetType,
  IProfileEntry,
  IProjectResourceItemType,
  IResourceOrigin,
  IStandardBaseFirmwareType,
} from '~/shared/defs';
import { generateRandomIdBase62 } from '~/shared/funcs/Utils';

// プロジェクトソースの単一文字列表現 `local#${projectId}` or `online#${projectId}`
export function createProjectKey(origin: IResourceOrigin, projectId: string) {
  return `${origin}#${projectId}`;
}

export function getOriginAndProjectIdFromProjectKey(projectKey: string): {
  origin: IResourceOrigin;
  projectId: string;
} {
  const [origin, projectId] = projectKey.split('#');
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
  existingIds: string[],
): string {
  const allNumbers = existingIds.map((it) => parseInt(it.replace(prefix, '')));
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  return `${prefix}${newNumber}`;
}

export function generateRandomDeviceInstanceCode(): string {
  return generateRandomIdBase62(4);
}

export function checkDeviceInstanceCodeValid(code: string): boolean {
  if (code === '0000') {
    return false;
  }
  return /^[0-9a-zA-Z]{4}$/.test(code);
}

const kermiteMcuCodeToMcuNameMap: { [key in string]: string } = {
  M01: 'ATmega32U4',
  M02: 'RP2040',
};
export function getMcuNameFromKermiteMcuCode(code: string) {
  return kermiteMcuCodeToMcuNameMap[code] || 'unknown';
}

export function getProjectKeyFromDeviceAttributes(
  deviceAttrs: IKeyboardDeviceAttributes,
): string {
  return `${deviceAttrs.origin}#${deviceAttrs.firmwareId}`;
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
  if (
    baseFirmwareType === 'AvrUnified' ||
    baseFirmwareType === 'AvrSplit' ||
    baseFirmwareType === 'AvrOddSplit'
  ) {
    return 'atmega32u4';
  } else {
    return 'rp2040';
  }
}

export function checkProfileEntryEquality(a: IProfileEntry, b: IProfileEntry) {
  return a.projectId === b.projectId && a.profileName === b.profileName;
}

export function stringifyProfileEntry(profileEntry: IProfileEntry): string {
  const { projectId, profileName } = profileEntry;
  return `${projectId}:${profileName}`;
}

export function parseProfileEntry(profileKey: string): IProfileEntry {
  const [projectId, profileName] = profileKey.split(':');
  return { projectId, profileName };
}

export function getNextFirmwareId(existingIds: string[]): string {
  const allNumbers = existingIds.map((id) => parseInt(id));
  if (!allNumbers.every((it) => isFinite(it))) {
    throw new Error('invalid firmware variation ids detected');
  }
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  if (newNumber >= 100) {
    throw new Error('firmware id reaches to 100');
  }
  return `00${newNumber.toString()}`.slice(-2);
}

export function encodeProjectResourceItemKey(
  itemType: IProjectResourceItemType,
  itemName: string,
): string {
  return `${itemType}:${itemName}`;
}

export function decodeProjectResourceItemKey(key: string): {
  itemType: IProjectResourceItemType;
  itemName: string;
} {
  const [itemType, itemName] = key.split(':');
  return { itemType: itemType as IProjectResourceItemType, itemName };
}

export function validateResourceName(
  resourceName: string,
  resourceTypeNameText: string,
): string | undefined {
  if (
    // eslint-disable-next-line no-misleading-character-class
    resourceName.match(/[/./\\:*?"<>|\u3000\u0e49]/) ||
    resourceName.match(/^\s+$/)
  ) {
    return `${resourceName} is not a valid ${resourceTypeNameText}.`;
  }
  if (resourceName.length > 32) {
    return `${resourceTypeNameText} should be no more than 32 characters.`;
  }
  return undefined;
}

export function validateResourceNameWithDuplicationCheck(
  resourceName: string,
  resourceTypeNameText: string,
  checkedResourceNames: string[],
): string | undefined {
  const error = validateResourceName(resourceName, resourceTypeNameText);
  if (error) {
    return error;
  }
  if (checkedResourceNames) {
    const existingName = checkedResourceNames.find(
      (it) => it.toLowerCase() === resourceName.toLowerCase(),
    );
    if (existingName) {
      return `${existingName} already exists.`;
    }
  }
  return undefined;
}
