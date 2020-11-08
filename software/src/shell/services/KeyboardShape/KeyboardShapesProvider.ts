import { IKeyboardShape } from '~defs/ProfileData';
import { IProjectResourceInfoProvider } from '~shell/services/serviceInterfaces';
import { KeyboardLayoutFileLoader } from './KeyboardLayoutFileLoader';

// キーボード品種ごとのレイアウトファイルを読み込み提供する
export class KeyboardShapesProvider {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider
  ) {}

  private getLayoutFilePathByProjectPath(
    projectPath: string
  ): string | undefined {
    const info = this.projectResourceInfoProvider
      .getAllProjectResourceInfos()
      .find((info) => info.projectPath === projectPath);
    if (info) {
      return this.projectResourceInfoProvider.getLayoutFilePath(info.projectId);
    }
    return undefined;
  }

  async loadKeyboardShapeByBreedName(
    breedName: string
  ): Promise<IKeyboardShape | undefined> {
    const projectPath = breedName;
    const layoutFilePath = this.getLayoutFilePathByProjectPath(projectPath);
    if (layoutFilePath) {
      return await KeyboardLayoutFileLoader.loadShapeFromFile(
        layoutFilePath,
        projectPath
      );
    }
    return undefined;
  }
}
