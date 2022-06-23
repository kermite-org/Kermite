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
  return await coreActionDistributor.putAction(action);
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

type ICoreActionSource = Required<ICoreAction>;

type ICoreModule = {
  [K in keyof ICoreActionSource]: (
    payload: ICoreActionSource[K],
  ) => void | Promise<void>;
};

export function createCoreModule<K extends keyof ICoreActionSource>(
  source: Pick<ICoreModule, K>,
) {
  return source;
}
