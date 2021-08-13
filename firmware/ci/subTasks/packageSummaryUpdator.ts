import {
  fsxReadJsonFile,
  fsxWriteJsonFile,
  globSync,
  pathBasename,
} from "../helpers";

interface ILayout {}

interface IPackageContent {
  formatRevision: string;
  projectId: string;
  keyboardName: string;
  layouts: {
    layoutName: string;
    data: ILayout;
  }[];
}

interface IPackageInfo {
  projectId: string;
  keyboardName: string;
  packageName: string;
  defaultLayout: ILayout;
}

interface IPackageSummaryContent {
  projects: IPackageInfo[];
}

export function packageSummaryUpdator_generateSummaryFile() {
  const projectFilePaths = globSync("./dist/projects/*.kmpkg.json");

  const projectCoreInfos: IPackageInfo[] = projectFilePaths.map(
    (projectFilePath) => {
      const packageName = pathBasename(projectFilePath, ".kmpkg.json");
      const source = fsxReadJsonFile(projectFilePath) as IPackageContent;
      return {
        projectId: source.projectId,
        keyboardName: source.keyboardName,
        packageName,
        defaultLayout: source.layouts[0].data,
      };
    }
  );

  const summaryContent: IPackageSummaryContent = {
    projects: projectCoreInfos,
  };

  fsxWriteJsonFile("./dist/project_summary.json", summaryContent);
}
