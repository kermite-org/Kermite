import {
  ActionDistributor,
  copyObjectProps,
  IActionReceiver,
  ICoreAction,
  ICoreState,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';

export type ICoreActionReceiver = IActionReceiver<ICoreAction>;

export const coreActionDistributor = new ActionDistributor<ICoreAction>();

export const coreState: ICoreState = {
  appVersion: '',
};

export const coreStateManager = {
  coreStateEventPort: createEventPort<Partial<ICoreState>>({
    initialValueGetter: () => coreState,
  }),
};

export function commitCoreState(diff: Partial<ICoreState>) {
  copyObjectProps(coreState, diff);
  coreStateManager.coreStateEventPort.emit(diff);
}
