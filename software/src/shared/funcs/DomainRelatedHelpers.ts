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
