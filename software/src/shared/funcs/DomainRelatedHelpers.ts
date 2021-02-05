import { IResourceOrigin } from '~/shared/defs';

export function createProjectSig(origin: IResourceOrigin, projectId: string) {
  return `${origin}#${projectId}`;
}

export function getProjectOriginAndIdFromSig(
  projectSig: string,
): { origin: IResourceOrigin; projectId: string } {
  const [origin, projectId] = projectSig.split('#');
  return { origin: origin as IResourceOrigin, projectId };
}

export function generateNextSequentialId(
  prefix: string,
  existingsIds: string[],
): string {
  const allNumbers = existingsIds.map((it) => parseInt(it.replace(prefix, '')));
  const newNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 0;
  return `${prefix}${newNumber}`;
}
