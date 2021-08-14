import { IPageSpec } from '~/ui/commonModels/PageTypes';

type IUiGlobalStore = {
  pageSpec: IPageSpec | undefined;
};

export const uiGlobalStore: IUiGlobalStore = {
  pageSpec: undefined,
};
