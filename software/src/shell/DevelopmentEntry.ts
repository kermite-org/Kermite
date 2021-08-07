import { projectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';

export async function shellDevelopmentEntry() {
  const projectPackages = await projectPackageProvider.getAllProjectPackageInfos();
  console.log({ projectPackages });
}
