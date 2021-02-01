import { IPersistKeyboardDesign } from '~/shared';
import { layoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { IProjectResourceInfoProvider } from '~/shell/services/serviceInterfaces';

// キーボード品種ごとのレイアウトファイルを読み込み提供する
export class KeyboardShapesProvider {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
  ) {}

  async loadKeyboardShapeByProjectIdAndLayoutName(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const info = this.projectResourceInfoProvider.internal_getProjectInfoSourceById(
      projectId,
    );
    if (info) {
      const layoutFilePath = this.projectResourceInfoProvider.getLayoutFilePath(
        projectId,
        layoutName,
      );
      if (layoutFilePath) {
        return await layoutFileLoader.loadLayoutFromFile(layoutFilePath);
      }
    }
    return undefined;
  }
}
