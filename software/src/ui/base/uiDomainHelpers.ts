import { IDisplayArea, IResourceOrigin } from '~/shared';

export function getKeyboardSvgViewBoxSpec(displayArea: IDisplayArea) {
  const { centerX, centerY, width, height } = displayArea;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return `${left} ${top} ${width} ${height}`;
}

export function getProjectDisplayNamePrefix(
  origin: IResourceOrigin,
  isDraft: boolean,
) {
  if (origin === 'local' && isDraft) {
    return '(local-draft)';
  } else if (origin === 'local') {
    return '(local)';
  } else {
    return '';
  }
}

export function getProjectDisplayNamePrefix2(
  origin: IResourceOrigin,
  isDraft: boolean,
) {
  if (origin === 'local' && isDraft) {
    return '(local-draft-package)';
  } else if (origin === 'local') {
    return '(local-package)';
  } else {
    return '';
  }
}
