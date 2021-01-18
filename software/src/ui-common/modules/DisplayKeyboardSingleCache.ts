import { IDisplayKeyboardDesign, IPersistKeyboardDesign } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/ui-common/modules/DisplayKeyboardDesignLoader';

const state = new (class {
  source!: IPersistKeyboardDesign;
  dest!: IDisplayKeyboardDesign;
})();

export function getDisplayKeyboardDesignSingleCached(
  design: IPersistKeyboardDesign,
): IDisplayKeyboardDesign {
  if (design !== state.source) {
    console.log(`create display keyboard design cache`);
    state.source = design;
    state.dest = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
  }
  return state.dest;
}
