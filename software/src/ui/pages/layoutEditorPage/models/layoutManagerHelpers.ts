import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { projectPackagesReader } from '~/ui/store';

export const layoutManagerHelpers = {
  getEditSourceDisplayText(
    editSource: ILayoutEditSource,
    editProjectInfo?: IProjectPackageInfo,
  ): string {
    if (editSource.type === 'LayoutNewlyCreated') {
      return `[NewlyCreated]`;
    } else if (editSource.type === 'CurrentProfile') {
      return `[CurrentProfileLayout]`;
    } else if (editSource.type === 'File') {
      return `[File]${editSource.filePath}`;
    } else if (editSource.type === 'ProjectLayout') {
      const { layoutName } = editSource;
      return `[ProjectLayout] ${editProjectInfo?.packageName} ${layoutName}`;
    }
    return '';
  },
  getSavingPackageFilePath(): string {
    const projectInfo = projectPackagesReader.getEditTargetProject();
    if (projectInfo) {
      return `data/projects/${projectInfo.packageName}.kmpkg`;
    }
    return '';
  },
};
