import { IDisplayKeyboardLayout, IPersistKeyboardLayout } from '~/app-shared';
import { DisplayKeyboardDesignLoader } from './displayKeyboardDesignLoader';

const state = new (class {
  source!: IPersistKeyboardLayout;
  dest!: IDisplayKeyboardLayout;
})();

export function getDisplayKeyboardDesignSingleCached(
  design: IPersistKeyboardLayout,
): IDisplayKeyboardLayout {
  if (design !== state.source) {
    state.source = design;
    state.dest = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
    // console.log(`display keyboard design created`);
  }
  return state.dest;
}
