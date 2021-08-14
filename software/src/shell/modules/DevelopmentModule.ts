import { delayMs } from '~/shared';
import { commitCoreState, ICoreActionReceiver } from '~/shell/global';

export const developmentModule_ActionReceiver: ICoreActionReceiver = {
  loadAppVersion() {
    (async () => {
      await delayMs(2000);
      commitCoreState({ appVersion: 'testapp-123' });
    })();
  },
  greet({ name, age }) {
    console.log(`hello ${name} ${age}`);
  },
};
