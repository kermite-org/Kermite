import {
  duplicateObjectByJsonStringifyParse,
  ILayer,
  IPersistKeyboardDesign,
  IProfileData,
} from '~/shared';

export namespace ProfileHelper {
  interface IKeyboardShape_PRF02 {
    breedName?: string;
    keyUnits: {
      id: string;
      x: number;
      y: number;
      r?: number;
      keyIndex: number;
    }[];
    bodyPathMarkupText: string;
    displayArea: {
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    };
  }

  type IAssigns = {
    // laX.kuY
    [address: string]: any;
  };

  type IProfileData_PRF02 = {
    revision: 'PRF02';
    keyboardShape: IKeyboardShape_PRF02;
    layers: ILayer[];
    assignType: any;
    settings: any;
    assigns: IAssigns;
  };

  function patchOldScheme(profileData: IProfileData_PRF02) {
    for (const la of profileData.layers) {
      if (la.defaultScheme === undefined) {
        la.defaultScheme = 'block';
      }
    }
    if (!profileData.assignType) {
      (profileData as any).assignType = 'single';
    }

    if (!profileData.settings) {
      if (profileData.assignType === 'single') {
        profileData.settings = {
          useShiftCancel: false,
        };
      }
      if (profileData.assignType === 'dual') {
        profileData.settings = {
          type: 'dual',
          useShiftCancel: false,
          primaryDefaultTrigger: 'down',
          tapHoldThresholdMs: 200,
          useInterruptHold: true,
        };
      }
    }
    if (profileData.settings.useShiftCancel === undefined) {
      profileData.settings.useShiftCancel = false;
    }

    profileData.layers.forEach((la) => {
      if (la.exclusionGroup === undefined) {
        la.exclusionGroup = 0;
      }
      if (la.initialActive === undefined) {
        la.initialActive = false;
      }
    });
  }

  function makeOutlineShapesFromDisplayArea(
    displayArea: IKeyboardShape_PRF02['displayArea'],
  ): IPersistKeyboardDesign['outlineShapes'] {
    const cx = displayArea.centerX;
    const cy = displayArea.centerY;
    const hw = displayArea.width / 2;
    const hh = displayArea.height / 2;

    const _points = [
      [cx + hw, cy - hh],
      [cx + hw, cy + hh],
      [cx - hw, cy + hh],
      [cx - hw, cy - hh],
    ];
    return [
      {
        points: _points.map(([x, y]) => ({ x, y })),
      },
    ];
  }

  function makeKeyboardDesignFromKeyboardShapePRF02(
    shape: IKeyboardShape_PRF02,
  ): IPersistKeyboardDesign {
    return {
      setup: {
        placementUnit: 'mm',
        placementAnchor: 'center',
        keySizeUnit: 'KP',
        keyIdMode: 'auto',
      },
      keyEntities: shape.keyUnits.map((ku) => {
        return {
          keyId: ku.id,
          x: ku.x,
          y: ku.y,
          angle: ku.r || 0,
          shape: 'std 1',
          keyIndex: ku.keyIndex,
        };
      }),
      outlineShapes: makeOutlineShapesFromDisplayArea(shape.displayArea),
      transGroups: [],
    };
  }

  function convertProfileFromPRF02(_profile: IProfileData_PRF02): IProfileData {
    const profile = duplicateObjectByJsonStringifyParse(_profile);
    patchOldScheme(profile);
    const { assignType, keyboardShape, settings, layers, assigns } = profile;
    return {
      revision: 'PRF03',
      projectId: '',
      assignType,
      settings,
      layers,
      keyboardDesign: makeKeyboardDesignFromKeyboardShapePRF02(keyboardShape),
      assigns,
    };
  }

  export function fixProfileData(profileData: IProfileData): IProfileData {
    if ((profileData.revision as string) === 'PRF02') {
      return convertProfileFromPRF02(profileData as any);
    }
    return profileData;
  }
}
