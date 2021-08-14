import { IUiState } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/commonModels/ActionDispatcher';

export const uiState: IUiState = {
  core: {
    appVersion: '',
  },
};

export const uiStateDriverEffect = () => {
  dispatchCoreAction({ loadAppVersion: 1 });

  dispatchCoreAction({ greet: { name: 'yamada', age: 20 } });
  return ipcAgent.events.global_coreStateEvents.subscribe((diff) => {
    uiState.core = { ...uiState.core, ...diff };
    console.log({ uiState });
  });
};
