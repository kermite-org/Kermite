import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { projectPackagesReader } from '~/ui/commonStore';

export const layoutManagerHelpers = {
  getEditSourceDisplayText(
    editSource: ILayoutEditSource,
    editProjectInfo?: IProjectPackageInfo,
  ) {
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
  getSavingPackageFilePath() {
    const projectInfo = projectPackagesReader.getEditTargetProject();
    if (projectInfo) {
      return `data/projects/${projectInfo.packageName}.kmpkg.json`;
    }
    return '';
  },
};
