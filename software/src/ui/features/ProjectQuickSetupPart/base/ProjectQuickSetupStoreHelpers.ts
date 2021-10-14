import {
  uniqueArrayItems,
  generateUniqueRandomId,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
  createProjectKey,
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
  __createDraftPackageInfo(): IProjectPackageInfo {
    const origin = 'local';
    const projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
    const keyboardName = 'draft project';
    const firmwareConfig: IStandardFirmwareEntry = {
      type: 'standard',
      variationId: '00',
      firmwareName: 'default',
      standardFirmwareConfig: {
        baseFirmwareType: 'AvrUnified',
      },
    };
    return {
      formatRevision: 'PKG0',
      origin,
      projectId,
      projectKey: createProjectKey(origin, projectId),
      keyboardName,
      packageName: keyboardName,
      firmwares: [firmwareConfig],
      layouts: [],
      profiles: [],
    };
  },
};
