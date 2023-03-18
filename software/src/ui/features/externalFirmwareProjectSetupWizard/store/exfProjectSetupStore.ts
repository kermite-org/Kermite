import produce from 'immer';
import {
  copyObjectProps,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  validateResourceName,
} from '~/shared';
import {
  fallbackLayoutGeneratorOptions,
  fallbackLayoutTemplateAttributes,
  ILayoutGeneratorOptions,
  ILayoutTemplateAttributes,
} from '~/ui/base';
import { createLayoutFromTemplateAttributes } from '~/ui/commonModels/draftLayoutGenerator';
import { projectQuickSetupStoreHelpers } from '~/ui/features/projectQuickSetupWizard/store/projectQuickSetupStoreHelpers';
import { dispatchCoreAction, globalSettingsWriter } from '~/ui/store';

type IState = {
  projectId: string;
  keyboardName: string;
  layoutTemplateAttrs: ILayoutTemplateAttributes;
  layoutOptions: ILayoutGeneratorOptions;
};

function createDefaultState(): IState {
  return {
    projectId: '',
    keyboardName: '',
    layoutTemplateAttrs: fallbackLayoutTemplateAttributes,
    layoutOptions: fallbackLayoutGeneratorOptions,
  };
}

const state: IState = createDefaultState();

const readers = {
  get keyboardNameValidationError(): string | undefined {
    return validateResourceName(state.keyboardName, 'keyboard name', true);
  },
  get isFirmwareConfigurationStepValid(): boolean {
    const { keyboardName } = state;
    const { keyboardNameValidationError } = readers;
    return !!keyboardName && !keyboardNameValidationError;
  },
  emitDraftProjectInfo(): IProjectPackageInfo {
    const { layoutTemplateAttrs, layoutOptions, projectId, keyboardName } =
      state;
    const layout = createLayoutFromTemplateAttributes(
      layoutTemplateAttrs,
      layoutOptions,
    );
    const projectInfo = projectQuickSetupStoreHelpers.createDraftPackageInfo({
      projectId,
      keyboardName,
    });
    const layoutEntry: IProjectLayoutEntry = {
      layoutName: 'main',
      data: layout,
    };
    projectInfo.layouts.push(layoutEntry);
    return projectInfo;
  },
};

const actions = {
  resetConfigurations() {
    copyObjectProps(state, createDefaultState());
    state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
  },
  setKeyboardName(keyboardName: string) {
    state.keyboardName = keyboardName;
    state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
  },
  writeLayoutOption<K extends keyof ILayoutGeneratorOptions>(
    key: K,
    value: ILayoutGeneratorOptions[K],
  ) {
    state.layoutOptions = produce(state.layoutOptions, (draft) => {
      draft[key] = value;
    });
  },
  writeTemplateAttrs<K extends keyof ILayoutTemplateAttributes>(
    key: K,
    value: ILayoutTemplateAttributes[K],
  ) {
    state.layoutTemplateAttrs = produce(state.layoutTemplateAttrs, (draft) => {
      draft[key] = value;
    });
  },
  async createProfile() {
    const projectInfo = readers.emitDraftProjectInfo();
    const { projectId } = projectInfo;
    await dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
    await globalSettingsWriter.writeValue('globalProjectSpec', {
      origin: 'local',
      projectId,
    });
    await dispatchCoreAction({
      profile_createProfileUnnamed: {
        targetProjectOrigin: 'local',
        targetProjectId: projectId,
        presetSpec: { type: 'blank', layoutName: 'main' },
      },
    });
  },
};

export const exfProjectSetupStore = { state, readers, actions };
