import {
  ICoreState,
  ILayoutEditSource,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import {
  coreState,
  coreStateManager,
  profilesReader,
} from '~/shell/modules/core';
import { layoutManagerModule } from '~/shell/modules/layout/layoutManagerModule';

const layoutEditSourceSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('LayoutNewlyCreated'),
  }),
  vObject({
    type: vValueEquals('CurrentProfile'),
  }),
  vObject({
    type: vValueEquals('File'),
    filePath: vString(),
  }),
  vObject({
    type: vValueEquals('ProjectLayout'),
    projectId: vString(),
    layoutName: vString(),
  }),
]);

function loadLayoutByEditSource(editSource: ILayoutEditSource) {
  if (editSource.type === 'LayoutNewlyCreated') {
    layoutManagerModule.layout_createNewLayout(1);
  } else if (editSource.type === 'CurrentProfile') {
    layoutManagerModule.layout_loadCurrentProfileLayout(1);
  } else if (editSource.type === 'File') {
    // const { filePath } = editSource;
    // layoutManagerModule.layout_loadFromFile({ filePath });
    // TODO: persist edit data for standalone layout
  } else if (editSource.type === 'ProjectLayout') {
    const { projectId, layoutName } = editSource;
    layoutManagerModule.layout_loadProjectLayout({ projectId, layoutName });
  }
}

function onCoreStateChange(diff: Partial<ICoreState>) {
  if (diff.profileEditSource) {
    if (
      diff.profileEditSource.type === 'InternalProfile' ||
      diff.profileEditSource.type === 'ProfileNewlyCreated'
    ) {
      layoutManagerModule.layout_loadCurrentProfileLayout(1);
    } else {
      layoutManagerModule.layout_createNewLayout(1);
    }
  }
}

function initialize() {
  const editSource = applicationStorage.readItemSafe<ILayoutEditSource>(
    'layoutEditSource',
    layoutEditSourceSchema,
    { type: 'CurrentProfile' },
  );
  try {
    // 前回起動時に編集していたファイルの読み込みを試みる
    loadLayoutByEditSource(editSource);
  } catch (error) {
    // 読み込めない場合は初期状態のままで、特にエラーを通知しない
    console.log(`error while loading previous edit layout file`);
    console.log(error);
  }

  if (coreState.layoutEditSource.type === 'CurrentProfile') {
    const profile = profilesReader.getCurrentProfile();
    if (!profile) {
      layoutManagerModule.layout_createNewLayout(1);
    }
  }

  coreStateManager.coreStateEventPort.subscribe(onCoreStateChange);
}
function terminate() {
  applicationStorage.writeItem('layoutEditSource', coreState.layoutEditSource);
  coreStateManager.coreStateEventPort.unsubscribe(onCoreStateChange);
}

export const layoutManagerRoot = {
  initialize,
  terminate,
};
