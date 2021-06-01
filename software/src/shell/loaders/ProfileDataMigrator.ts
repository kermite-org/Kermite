import { bumpObjectProps, IPersistProfileData } from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';

export namespace ProfileDataMigrator {
  function fixProfileDataPRF03toPRF04(profile: IPersistProfileData) {
    // PRF03 --> PRF04
    // profile.assignType を profile.settings.assingTypeに移動
    // アサインを辞書形式から配列形式に変更
    console.log(`PRF03 --> PRF04`);
    const _profile = (profile as any) as {
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
      profile.assigns = ProfileDataConverter.convertAssingsDictionaryToArray(
        profile.assigns,
      );
    }
  }

  function fixProfileDataPRF04toPRF05(profile: IPersistProfileData) {
    // PRF04 --> PRF05
    // mappingEntriesを追加
    // K_OSをK_Guiに変更
    console.log(`PRF04 --> PRF05`);
    profile.formatRevision = 'PRF05';
    profile.mappingEntries = [];

    const replaced = JSON.parse(
      JSON.stringify(profile).replace(/"K_OS"/g, '"K_Gui"'),
    );
    bumpObjectProps(profile, replaced);
  }

  export function fixProfileData(
    profile: IPersistProfileData,
  ): IPersistProfileData {
    if (!profile.formatRevision) {
      throw new Error('profile file format too old');
    }
    if (profile.formatRevision === <string>'PRF03') {
      fixProfileDataPRF03toPRF04(profile);
    }
    if (profile.formatRevision === <string>'PRF04') {
      fixProfileDataPRF04toPRF05(profile);
    }
    return profile;
  }
}
