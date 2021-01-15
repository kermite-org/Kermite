import { IKeyboardShape } from '@shared';
import { IProjectResourceInfoProvider } from '~/services0/serviceInterfaces';
import { KeyboardLayoutFileLoader } from './KeyboardLayoutFileLoader';

// キーボード品種ごとのレイアウトファイルを読み込み提供する
export class KeyboardShapesProvider {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
  ) {}

  async loadKeyboardShapeByProjectIdAndLayoutName(
    projectId: string,
    layoutName: string,
  ): Promise<IKeyboardShape | undefined> {
    const info = this.projectResourceInfoProvider.internal_getProjectInfoSourceById(
      projectId,
    );
    if (info) {
      const layoutFilePath = this.projectResourceInfoProvider.getLayoutFilePath(
        projectId,
        layoutName,
      );
      if (layoutFilePath) {
        return await KeyboardLayoutFileLoader.loadShapeFromFile(layoutFilePath);
      }
    }
    return undefined;
  }
}
