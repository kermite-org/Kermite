import { h } from 'qx';

function findSpecificDatasetValueFromParents(
  el: HTMLElement,
  datasetName: string,
  depth: number,
): string | undefined {
  if (depth <= 0) {
    return undefined;
  }
  const value = el.dataset[datasetName];
  if (value) {
    return value;
  }
  const parent = el.parentElement;
  if (parent) {
    return findSpecificDatasetValueFromParents(parent, datasetName, depth--);
  }
  return undefined;
}

export const globalHintMouseMoveHandler = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  const instArea = document.getElementById('domHintDisplayText');
  if (!(el && instArea)) {
    return;
  }
  const hint = findSpecificDatasetValueFromParents(el, 'hint', 3);
  instArea.innerText = hint || '';
};

export const GlobalHintDisplayText = () => <span id="domHintDisplayText" />;
