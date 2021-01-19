import { IProfileData } from '~/shared';

export namespace ProfileHelper {
  export function fixProfileData(profileData: IProfileData) {
    if ((profileData.revision as string) === 'PRF02') {
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

      // todo: keyboardShapeを新しい定義に変換
    }
  }
}
