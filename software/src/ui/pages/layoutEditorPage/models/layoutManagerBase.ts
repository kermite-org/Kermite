import { ILayoutEditSource } from '~/shared';

export type ILayoutManagerEditTarget = 'CurrentProfile' | 'LayoutFile';

export type ILayoutManagerModalState =
  | 'None'
  | 'LoadFromProject'
  | 'SaveToProject'
  | 'CopyFromProject'
  | 'LoadKicadPcbShape';
export const layoutManagerState = new (class {
  layoutEditSource: ILayoutEditSource = { type: 'CurrentProfile' };
  modalState: ILayoutManagerModalState = 'None';
})();
