import { makeCssColor } from '../../ui-common/base/ColorHelper';

const primaryBase = 0x00aa99;
// const primaryBase = 0x3080e0;

export const uiTheme = {
  colors: {
    primary: makeCssColor(primaryBase),
    primaryWeaken: makeCssColor(primaryBase, 0.25),
  },
  unitHeight: 28,
};
