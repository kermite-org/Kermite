import {
  IDisplayKeyboardDesign,
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProfileData,
  IProjectPackage,
} from './types';

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
    keyboardDesign: createFallbackPersistKeyboardDesign(),
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

export function createFallbackPersistKeyboardDesign(): IPersistKeyboardDesign {
  const defaultKeyboardDesignSetup: IPersistKeyboardDesign['setup'] = {
    placementUnit: 'KP 19.05',
    placementAnchor: 'topLeft',
    keySizeUnit: 'KP 19.05',
    keyIdMode: 'auto',
  };
  return {
    formatRevision: 'LA01',
    setup: { ...defaultKeyboardDesignSetup },
    keyEntities: [],
    outlineShapes: [],
    transformationGroups: [],
  };
}

export function createFallbackDisplayKeyboardDesign(): IDisplayKeyboardDesign {
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
