import { getIpcRendererAgent, IAppIpcContract } from '@kermite/shared';

export async function ipcExample() {
  const agent = getIpcRendererAgent<IAppIpcContract>();

  const version = agent.sync.dev_getVersionSync();
  console.log(`[page1] version`, { version });

  agent.subscribe('dev_testEvent', (ev) => {
    console.log(`[page1] test event received: ${ev.type}`);
  });
}
