// const state = new (class {})();

import produce from 'immer';
import { jsx, useEffect } from 'qx';
import {
  createProjectKey,
  fallbackStandardKeyboardSpec,
  generateUniqueRandomId,
  IKermiteStandardKeyboardSpec,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
  uniqueArrayItems,
} from '~/shared';
import { FcWithClassName } from '~/ui/base';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_OutputPropsSupplier,
} from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { dispatchCoreAction, uiState } from '~/ui/store';

const helpers = {
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
  createDraftPackageInfo(): IProjectPackageInfo {
    const origin = 'local';
    const projectId = helpers.generateUniqueProjectId();
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

const actions = {
  resetState() {
    const draftPackageInfo = helpers.createDraftPackageInfo();
    dispatchCoreAction({
      project_saveLocalDraftProjectPackageInfo: draftPackageInfo,
    });
  },
  saveFirmwareConfig(data: IKermiteStandardKeyboardSpec) {
    const draftPackageInfo = uiState.core.draftProjectPackageInfo!;
    const newDraftPackageInfo = produce(draftPackageInfo, (draft) => {
      const entry = draft.firmwares[0] as IStandardFirmwareEntry;
      entry.standardFirmwareConfig = data;
      entry.variationId = helpers.getNextVariationId(entry.variationId);
    });
    dispatchCoreAction({
      project_saveLocalDraftProjectPackageInfo: newDraftPackageInfo,
    });
  },
};

function useProjectQuickSetupPartModel() {
  useEffect(actions.resetState, []);
  const { editValues, canSave } = StandardFirmwareEditor_OutputPropsSupplier;
  useEffect(() => {
    if (canSave) {
      actions.saveFirmwareConfig(editValues);
    }
  }, [editValues, canSave]);
}

export const FirmwareConfigurationSection: FcWithClassName = ({
  className,
}) => {
  useProjectQuickSetupPartModel();
  return (
    <SectionFrame title="Firmware Configuration" class={className}>
      <StandardFirmwareEditor
        firmwareConfig={fallbackStandardKeyboardSpec}
        isNewConfig={true}
      />
    </SectionFrame>
  );
};
