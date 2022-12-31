import {
  IDisplayKeyboardLayout,
  IPersistKeyboardLayout,
  IPersistProfileData,
  IProfileData,
  IProjectPackage,
} from '../domain-base';

export function createFallbackPersistProfileData(): IPersistProfileData {
  return {
    formatRevision: 'PRF07',
    projectId: '',
    settings: {
      assignType: 'single',
      shiftCancelMode: 'none',
    },
    layers: [
      {
        layerId: 'la0',
        layerName: 'main',
        defaultScheme: 'block',
        attachedModifiers: 0,
        exclusionGroup: 0,
        initialActive: true,
      },
    ],
    assigns: [],
    mappingEntries: [],
    referredLayoutName: '',
  };
}

export function createFallbackProfileData(): IProfileData {
  return {
    projectId: '',
    keyboardLayout: createFallbackPersistKeyboardLayout(),
    settings: {
      assignType: 'single',
      shiftCancelMode: 'none',
    },
    layers: [
      {
        layerId: 'la0',
        layerName: 'main',
        defaultScheme: 'block',
        attachedModifiers: 0,
        exclusionGroup: 0,
        initialActive: true,
      },
    ],
    assigns: {},
    mappingEntries: [],
  };
}

export function createDefaultKeyboardLayoutSetup(): IPersistKeyboardLayout['setup'] {
  return {
    placementUnit: 'KP 19.05',
    placementAnchor: 'topLeft',
    keySizeUnit: 'KP 19.05',
    keyIdMode: 'auto',
  };
}
export const defaultKeyboardDesignSetup = createDefaultKeyboardLayoutSetup();

export function createFallbackPersistKeyboardLayout(): IPersistKeyboardLayout {
  return {
    formatRevision: 'LA01',
    setup: createDefaultKeyboardLayoutSetup(),
    keyEntities: [],
    outlineShapes: [],
    transformationGroups: [],
  };
}

export function createFallbackDisplayKeyboardLayout(): IDisplayKeyboardLayout {
  return {
    keyEntities: [],
    outlineShapes: [],
    displayArea: {
      centerX: 0,
      centerY: 0,
      width: 100,
      height: 100,
    },
    extraShapes: [],
  };
}

export function createFallbackProjectPackage(): IProjectPackage {
  return {
    formatRevision: 'PKG1',
    projectId: '',
    projectName: '',
    variationName: '',
    profiles: [],
    layouts: [],
    firmwares: [],
  };
}
