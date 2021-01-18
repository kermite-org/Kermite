import { makeCssColor } from './ColorHelper';

const primaryBase = 0x00aa88;
// const primaryBase = 0x0088ff;

export const uiTheme = {
  colors: {
    primary: makeCssColor(primaryBase),
    primaryWeaken: makeCssColor(primaryBase, 0.25),
  },
  unitHeight: 28,
};
