import {
  duplicateObjectByJsonStringifyParse,
  IAssignEntry,
  ILayer,
  IPersistKeyboardDesign,
  IPersistProfileData,
} from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';

export namespace ProfileDataMigrator {
  /*
export type IProfileData_PRF02 = {
  revision: 'PRF02';
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  // strong fallback layer is checked after when there aren't any assigns found
  strongFallbackLayerId?: string;
  layers: ILayer[];
} & (
  | {
      assignType: 'single';
      settings: {
        useShiftCancel: boolean;
      };
      assigns: {
        // laX.kuY
        [address: string]:
          | IAssignEntry_Single
          | IAssingEntry_Block
          | IAssignEntry_Transparent
          | undefined;
      };
    }
  | {
      assignType: 'dual';
      settings: {
        type: 'dual';
        useShiftCancel: boolean;
        primaryDefaultTrigger: 'down' | 'tap';
        useInterruptHold: boolean;
        tapHoldThresholdMs: number;
      };
      assigns: {
        // laX.kuY
        [address: string]:
          | IAssignEntry_Dual
          | IAssingEntry_Block
          | IAssignEntry_Transparent
          | undefined;
      };
    }
);
*/

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

  type IProfileData_PRF02 = {
    revision: 'PRF02';
    keyboardShape: IKeyboardShape_PRF02;
    layers: ILayer[];
    assignType: 'single' | 'dual';
    settings:
      | {
          useShiftCancel: boolean;
        }
      | {
          type: 'dual';
          useShiftCancel: boolean;
          primaryDefaultTrigger: 'down' | 'tap';
          useInterruptHold: boolean;
          tapHoldThresholdMs: number;
        };
    assigns: {
      // laX.kuY
      [address: string]: IAssignEntry | undefined;
    };
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

    Object.values(profileData.assigns).forEach((assign) => {
      if (assign?.type === 'single') {
        if (assign.op?.type === 'layerCall') {
          if ((assign.op.invocationMode as any) === 'exclusive') {
            assign.op.invocationMode = 'turnOn';
          }
        }
      }
    });
  }

  const fallbackDisplayArea: IKeyboardShape_PRF02['displayArea'] = {
    centerX: 0,
    centerY: 50,
    width: 300,
    height: 120,
  };

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
      formatRevision: 'LA00',
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
      outlineShapes: makeOutlineShapesFromDisplayArea(
        shape.displayArea || fallbackDisplayArea,
      ),
      transGroups: [],
    };
  }

  function convertProfileFromPRF02(
    _profile: IProfileData_PRF02,
  ): IPersistProfileData {
    const profile = duplicateObjectByJsonStringifyParse(_profile);
    patchOldScheme(profile);
    const { keyboardShape, settings, layers, assigns } = profile;
    return {
      revision: 'PRF03',
      projectId: '',
      settings:
        'type' in settings && settings.type === 'dual'
          ? { ...settings, assignType: 'dual' }
          : { ...settings, assignType: 'single' },
      layers,
      keyboardDesign: makeKeyboardDesignFromKeyboardShapePRF02(keyboardShape),
      assigns: ProfileDataConverter.convertAssingsDictionaryToArray(assigns),
    };
  }

  function fixProfileDataPRF03(profile: IPersistProfileData) {
    const _profile = profile as any;
    if (!_profile.settings.assignType) {
      _profile.settings.assignType = _profile.assignType;
    }
    LayoutDataMigrator.patchOldFormatLayoutData(profile.keyboardDesign);

    if (!Array.isArray(profile.assigns)) {
      profile.assigns = ProfileDataConverter.convertAssingsDictionaryToArray(
        profile.assigns,
      );
    }
  }

  export function fixProfileData(
    profileData: IPersistProfileData,
  ): IPersistProfileData {
    if ((profileData.revision as string) === 'PRF02') {
      return convertProfileFromPRF02(profileData as any);
    } else if (profileData.revision === 'PRF03') {
      fixProfileDataPRF03(profileData);
    }
    return profileData;
  }
}
