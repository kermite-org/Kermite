import {
  bumpObjectProps,
  duplicateObjectByJsonStringifyParse,
  encodeModifierVirtualKeys,
  IAssignOperation,
  ILayer,
  IPersistAssignEntry,
  IPersistProfileData,
  IProfileSettings,
  ModifierVirtualKey,
  ProfileDataConverter,
} from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';

namespace ProfileDataMigratorHelper {
  export function patchAllLayers(layers: ILayer[], fn: (la: ILayer) => void) {
    for (const layer of layers) {
      fn(layer);
    }
  }

  export function patchAllAssignOperations(
    assigns: IPersistAssignEntry[],
    fn: (op: IAssignOperation) => void,
  ) {
    for (const _assign of assigns) {
      const assign = _assign.usage;
      if (assign?.type === 'single') {
        if (assign.op) {
          fn(assign.op);
        }
      }
      if (assign?.type === 'dual') {
        !!assign.primaryOp && fn(assign.primaryOp);
        !!assign.secondaryOp && fn(assign.secondaryOp);
        !!assign.tertiaryOp && fn(assign.tertiaryOp);
      }
    }
  }

  export function fixAttachedModifiersFormat(
    attachedModifiers: ModifierVirtualKey[] | number | undefined,
  ) {
    if (attachedModifiers === undefined) {
      return 0;
    }
    if (Array.isArray(attachedModifiers)) {
      return encodeModifierVirtualKeys(attachedModifiers);
    }
    return attachedModifiers;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showLog(text: string) {
  // console.log(text);
}

export namespace ProfileDataMigrator {
  function fixProfileDataPRF03toPRF04(profile: IPersistProfileData) {
    // PRF03 --> PRF04
    // profile.assignType を profile.settings.assignTypeに移動
    // アサインを辞書形式から配列形式に変更
    showLog(`PRF03 --> PRF04`);
    const _profile = profile as any as {
      formatRevision: string;
      settings: {
        assignType?: 'single' | 'dual';
      };
      assignType?: 'single' | 'dual';
    };
    _profile.formatRevision = 'PRF04';
    if (!_profile.settings.assignType && _profile.assignType) {
      _profile.settings.assignType = _profile.assignType;
    }
    LayoutDataMigrator.patchOldFormatLayoutData(profile.keyboardDesign);
    if (!Array.isArray(profile.assigns)) {
      profile.assigns = ProfileDataConverter.convertAssignsDictionaryToArray(
        profile.assigns,
      );
    }
  }

  function fixProfileDataPRF04toPRF05(profile: IPersistProfileData) {
    // PRF04 --> PRF05
    // mappingEntriesを追加
    // K_OSをK_Guiに変更
    showLog(`PRF04 --> PRF05`);
    (profile as any).formatRevision = 'PRF05';
    profile.mappingEntries = [];

    const replaced = JSON.parse(
      JSON.stringify(profile).replace(/"K_OS"/g, '"K_Gui"'),
    );
    bumpObjectProps(profile, replaced);
  }

  function fixProfileDataPRF05toPRF06(profile: IPersistProfileData) {
    // PRF05 --> PRF06
    // attachedModifiersをキー名の配列からビットフラグに変更
    (profile as any).formatRevision = 'PRF06';
    showLog(`PRF05 --> PRF06`);
    ProfileDataMigratorHelper.patchAllLayers(profile.layers, (la) => {
      la.attachedModifiers =
        ProfileDataMigratorHelper.fixAttachedModifiersFormat(
          la.attachedModifiers,
        );
    });
    ProfileDataMigratorHelper.patchAllAssignOperations(
      profile.assigns,
      (op) => {
        if (op.type === 'keyInput') {
          op.attachedModifiers =
            ProfileDataMigratorHelper.fixAttachedModifiersFormat(
              op.attachedModifiers,
            );
        }
      },
    );
  }

  function fixProfileDataPRF06(profile: IPersistProfileData) {
    if (profile.projectId.length > 6) {
      profile.projectId = profile.projectId.slice(0, 6);
    }
    if (profile.projectId === '') {
      profile.projectId = '000000';
    }
    if (!profile.mappingEntries) {
      profile.mappingEntries = [];
    }
    const settings = profile.settings as IProfileSettings & {
      useShiftCancel?: Boolean;
    };
    if (
      settings.shiftCancelMode === undefined &&
      'useShiftCancel' in settings
    ) {
      settings.shiftCancelMode = settings.useShiftCancel
        ? 'shiftLayer'
        : 'none';
      delete settings.useShiftCancel;
    }
    if (
      settings.assignType === 'dual' &&
      settings.secondaryDefaultTrigger === undefined
    ) {
      settings.secondaryDefaultTrigger = 'down';
    }
  }

  export function fixProfileData(
    sourceProfile: IPersistProfileData,
  ): IPersistProfileData {
    const profile = duplicateObjectByJsonStringifyParse(sourceProfile);

    if (!profile.formatRevision) {
      throw new Error('profile file format is too old');
    }
    if (profile.formatRevision === <string>'PRF03') {
      fixProfileDataPRF03toPRF04(profile);
    }
    if (profile.formatRevision === <string>'PRF04') {
      fixProfileDataPRF04toPRF05(profile);
    }
    if (profile.formatRevision === <string>'PRF05') {
      fixProfileDataPRF05toPRF06(profile);
    }
    if (profile.formatRevision === <string>'PRF06') {
      fixProfileDataPRF06(profile);
    }
    return profile;
  }
}
