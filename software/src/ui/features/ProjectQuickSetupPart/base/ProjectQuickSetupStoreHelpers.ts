import {
  uniqueArrayItems,
  generateUniqueRandomId,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
  createProjectKey,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { uiState } from '~/ui/store';

export const projectQuickSetupStoreHelpers = {
  getNextVariationId(current: string): string {
    const count = parseInt(current);
    const nextCount = (count + 1) % 100;
    return nextCount.toString().padStart(2, '0');
  },
  generateUniqueProjectId(): string {
    const existingProjectIds = uniqueArrayItems(
      uiState.core.allProjectPackageInfos.map((it) => it.projectId),
    );
    return generateUniqueRandomId(6, existingProjectIds);
  },
  createDraftPackageInfo(
    projectId: string,
    keyboardName: string,
    firmwareConfig: IKermiteStandardKeyboardSpec,
    firmwareName: string,
  ): IProjectPackageInfo {
    const origin = 'local';
    const firmwareEntry: IStandardFirmwareEntry = {
      type: 'standard',
      variationId: '01',
      firmwareName: firmwareName,
      standardFirmwareConfig: firmwareConfig,
    };
    return {
      formatRevision: 'PKG0',
      origin,
      projectId,
      projectKey: createProjectKey(origin, projectId),
      keyboardName,
      packageName: keyboardName,
      firmwares: [firmwareEntry],
      layouts: [],
      profiles: [],
    };
  },
};
