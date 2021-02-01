import { IPersistKeyboardDesign } from '~/shared';
import { layoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { projectResourceInfoProvider } from '~/shell/projects';

// キーボード品種ごとのレイアウトファイルを読み込み提供する
export class KeyboardShapesProvider {
  async loadKeyboardShapeByProjectIdAndLayoutName(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const info = projectResourceInfoProvider.internal_getProjectInfoSourceById(
      projectId,
    );
    if (info) {
      const layoutFilePath = projectResourceInfoProvider.getLayoutFilePath(
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
