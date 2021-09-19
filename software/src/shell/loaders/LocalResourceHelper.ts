import { fsExistsSync, pathJoin } from '~/shell/funcs';

export function checkLocalRepositoryFolder(
  localRepositoryRootDir: string,
): boolean {
  const projectsRoot = pathJoin(
    localRepositoryRootDir,
    'firmware/src/projects',
  );
  return fsExistsSync(projectsRoot);
}
