import { appGlobal } from '~/base/appGlobal';

export function setupIpcBackend() {
  appGlobal.icpMainAgent.supplySyncHandlers({
    getVersionSync: () => 'v100',
  });
  appGlobal.icpMainAgent.supplyAsyncHandlers({
    getVersion: async () => 'v100',
    addNumber: async (a: number, b: number) => a + b,
  });

  setTimeout(() => {
    appGlobal.icpMainAgent.emitEvent('testEvent', { type: 'test' });
  }, 2000);
}
