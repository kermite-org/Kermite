import {
  ActionDistributor,
  copyObjectProps,
  defaultCoreState,
  IActionReceiver,
  ICoreAction,
  ICoreState,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';

export type ICoreActionReceiver = IActionReceiver<ICoreAction>;

export const coreActionDistributor = new ActionDistributor<ICoreAction>();

export async function dispatchCoreAction(action: ICoreAction) {
  await coreActionDistributor.putAction(action);
}

export const coreState: ICoreState = defaultCoreState;

export const coreStateManager = {
  coreStateEventPort: createEventPort<Partial<ICoreState>>({
    initialValueGetter: () => coreState,
  }),
};

export function commitCoreState(diff: Partial<ICoreState>) {
  copyObjectProps(coreState, diff);
  coreStateManager.coreStateEventPort.emit(diff);
}

export function createCoreModule(
  source: {
    [K in keyof ICoreAction]?: (
      payload: NonNullable<ICoreAction[K]>,
    ) => void | Promise<void>;
  },
) {
  return source;
}
