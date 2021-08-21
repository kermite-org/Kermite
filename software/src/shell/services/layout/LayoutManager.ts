import { ILayoutEditSource } from '~/shared';
import {
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import { coreState, profilesReader } from '~/shell/global';
import { layoutManagerModule } from '~/shell/services/layout/LayoutManagerModule';

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

export const layoutManager = {
  async loadLayoutByEditSource(editSource: ILayoutEditSource) {
    if (editSource.type === 'LayoutNewlyCreated') {
      layoutManagerModule.layout_createNewLayout(1);
    } else if (editSource.type === 'CurrentProfile') {
      layoutManagerModule.layout_loadCurrentProfileLayout(1);
    } else if (editSource.type === 'File') {
      const { filePath } = editSource;
      await layoutManagerModule.layout_loadFromFile({ filePath });
    } else if (editSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = editSource;
      layoutManagerModule.layout_loadProjectLayout({ projectId, layoutName });
    }
  },
  async initializeAsync() {
    const editSource = applicationStorage.readItemSafe<ILayoutEditSource>(
      'layoutEditSource',
      layoutEditSourceSchema,
      { type: 'CurrentProfile' },
    );
    try {
      // 前回起動時に編集していたファイルの読み込みを試みる
      await this.loadLayoutByEditSource(editSource);
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
  },
  terminate() {
    applicationStorage.writeItem(
      'layoutEditSource',
      coreState.layoutEditSource,
    );
  },
};
