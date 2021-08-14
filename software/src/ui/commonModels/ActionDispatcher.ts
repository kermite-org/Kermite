import { ICoreAction, IUiAction } from '~/shared/defs';
import { ipcAgent } from '~/ui/base';

export function dispatchCoreAction(action: ICoreAction) {
  ipcAgent.async.global_dispatchCoreAction(action);
}

export function dispatchUiAction(_action: IUiAction) {}
