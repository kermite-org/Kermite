import { IKeyboardShape } from '~defs/ProfileData';
import { ProjectResourceInfoProvider } from '../ProjectResource/ProjectResourceInfoProvider';
import { KeyboardLayoutFileLoader } from './KeyboardLayoutFileLoader';

// キーボード品種ごとのレイアウトファイルを読み込み提供する
export class KeyboardShapesProvider {
  constructor(
    private projectResourceInfoProvider: ProjectResourceInfoProvider
  ) {}

  getAvailableBreedNames(): string[] {
    return this.projectResourceInfoProvider
      .getAllProjectResourceInfos()
      .filter((info) => info.hasLayout)
      .map((info) => info.projectPath);
  }

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
