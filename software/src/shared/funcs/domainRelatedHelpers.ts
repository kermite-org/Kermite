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
import { generateRandomIdBase62 } from '~/shared/funcs/utils';

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
  // M01: 'ATmega32U4',
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
  const isBootloaderRp2040 = bootloaderType === 'rp2040uf2';
  return isBootloaderRp2040 && firmwareTargetDevice === 'rp2040';
}

export function getFirmwareTargetDeviceFromBaseFirmwareType(
  baseFirmwareType: IStandardBaseFirmwareType,
): IFirmwareTargetDevice {
  if (
    baseFirmwareType === 'RpUnified' ||
    baseFirmwareType === 'RpSplit' ||
    baseFirmwareType === 'RpOddSplit'
  ) {
    return 'rp2040';
  } else {
    throw new Error('invalid baseFirmwareType');
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

export function getNextFirmwareVariationId(existingIds: string[]): string {
  const allNumbers = existingIds.map((id) => parseInt(id));
  if (!allNumbers.every((it) => isFinite(it))) {
    throw new Error('invalid firmware variation ids detected');
  }
  let newNumber = -1;
  for (let i = 0; i < 100; i++) {
    newNumber = (Math.random() * 100) >> 0;
    if (!allNumbers.includes(newNumber)) {
      break;
    }
  }
  if (newNumber === -1) {
    throw new Error('failed to generate firmware id');
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
  prohibitMultiByteCharacters?: boolean,
): string | undefined {
  if (
    // eslint-disable-next-line no-misleading-character-class
    resourceName.match(/[./\\:*?"<>|\u3000\u0e49\u0e47\u0e14\u0e2a]/) ||
    resourceName.match(/^\s+$/)
  ) {
    return `${resourceName} is not a valid ${resourceTypeNameText}.`;
  }
  if (prohibitMultiByteCharacters) {
    if (resourceName.match(/[^ -~]/)) {
      return `${resourceName} is not a valid ${resourceTypeNameText}.`;
    }
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
      const resourceType = resourceTypeNameText.replace(' name', '');
      return `${resourceType} ${existingName} already exists.`;
    }
  }
  return undefined;
}
