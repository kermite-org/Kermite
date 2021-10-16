import {
  createProjectKey,
  generateUniqueRandomId,
  IProjectPackageInfo,
  uniqueArrayItems,
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
  createDraftPackageInfo(args: {
    projectId: string;
    keyboardName: string;
  }): IProjectPackageInfo {
    const { projectId, keyboardName } = args;
    const origin = 'local';
    return {
      isDraft: true,
      formatRevision: 'PKG0',
      origin,
      projectId,
      projectKey: createProjectKey(origin, projectId),
      keyboardName,
      packageName: keyboardName,
      firmwares: [],
      layouts: [],
      profiles: [],
    };
  },
};
