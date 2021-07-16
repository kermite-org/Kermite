import { IGlobalSettings } from '~/shared';
import {
  vBoolean,
  vObject,
  vString,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';

export namespace GlobalSettingsProvider {
  const globalSettingsSchema = vObject({
    useOnlineResources: vBoolean(),
    useLocalResouces: vBoolean(),
    localProjectRootFolderPath: vString(),
  });

  const globalSettingsDefault: IGlobalSettings = {
    useOnlineResources: true,
    useLocalResouces: false,
    localProjectRootFolderPath: '',
    allowCrossKeyboardKeyMappingWrite: false,
  };

  export function getGlobalSettings(): IGlobalSettings {
    return applicationStorage.readItemBasedOnDefault(
      'globalSettings',
      globalSettingsSchema,
      globalSettingsDefault,
    );
  }

  export function writeGlobalSettings(settings: IGlobalSettings) {
    return applicationStorage.writeItem('globalSettings', settings);
  }
}
