import { IDisplayKeyboardDesign, IPersistKeyboardDesign } from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';

const state = new (class {
  source!: IPersistKeyboardDesign;
  dest!: IDisplayKeyboardDesign;
})();

export function getDisplayKeyboardDesignSingleCached(
  design: IPersistKeyboardDesign,
): IDisplayKeyboardDesign {
  if (design !== state.source) {
    state.source = design;
    state.dest = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
    // console.log(`display keyboard design created`);
  }
  return state.dest;
}
