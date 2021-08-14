import { ICoreAction } from '~/shared/defs';
import { ipcAgent } from '~/ui/base';
import { IUiAction } from '~/ui/commonModels/UiState';

export function dispatchCoreAction(action: ICoreAction) {
  ipcAgent.async.global_dispatchCoreAction(action);
}

export function dispatchUiAction(_action: IUiAction) {}
