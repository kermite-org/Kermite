import produce from 'immer';
import { css, FC, jsx, useEffect } from 'qx';
import {
  createProjectKey,
  fallbackStandardKeyboardSpec,
  generateUniqueRandomId,
  IKermiteStandardKeyboardSpec,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
  uniqueArrayItems,
} from '~/shared';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_OutputPropsSupplier,
} from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { dispatchCoreAction, uiState } from '~/ui/store';

// const state = new (class {})();

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

export const ProjectQuickSetupPart: FC = () => {
  useProjectQuickSetupPartModel();

  return (
    <div class={style}>
      <div class="top-row"></div>
      <div class="main-row">
        <SectionFrame
          title="Firmware Configuration"
          class="firmware-config-column"
        >
          <StandardFirmwareEditor
            firmwareConfig={fallbackStandardKeyboardSpec}
            isNewConfig={true}
          />
        </SectionFrame>

        <SectionFrame title="Layout Configuration" class="layout-config-column">
          bbb
        </SectionFrame>
      </div>
      <div class="bottom-row">
        <div class="flash-column">ddd</div>
        <div class="connection-column">eee</div>
        <div class="actions-column">fff</div>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .top-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 40px;
  }

  > .main-row {
    height: 0;
    flex-grow: 1;
    display: flex;

    > .firmware-config-column {
      width: 55%;
      overflow-y: scroll;
    }
    > .layout-config-column {
      width: 45%;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 120px;
    display: flex;
    justify-content: space-between;
    > * {
      border: solid 1px green;
    }
  }
`;
