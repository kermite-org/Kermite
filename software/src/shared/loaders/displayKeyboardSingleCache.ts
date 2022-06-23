import { IDisplayKeyboardDesign, IPersistKeyboardDesign } from '~/shared/defs';
import { DisplayKeyboardDesignLoader } from '~/shared/loaders/displayKeyboardDesignLoader';

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
