import { IPersistProfileData } from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';

export namespace ProfileDataMigrator {
  function fixProfileDataPRF03(profile: IPersistProfileData) {
    // PRF03 --> PRF04
    // profile.assignType を profile.settings.assingTypeに移動
    // アサインを辞書形式から配列形式に変更
    console.log(`PRF03 --> PRF04`);
    profile.formatRevision = 'PRF04';
    const _profile = (profile as any) as {
      settings: {
        assignType?: 'single' | 'dual';
      };
      assignType?: 'single' | 'dual';
    };
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

  export function fixProfileData(
    profile: IPersistProfileData,
  ): IPersistProfileData {
    if (!profile.formatRevision) {
      throw new Error('profile file format too old');
    }
    if (profile.formatRevision === <string>'PRF03') {
      fixProfileDataPRF03(profile);
    }
    return profile;
  }
}
