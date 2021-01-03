import { getIpcRendererAgent, IAppIpcContract } from '@kermite/shared';

export async function ipcExample() {
  const agent = getIpcRendererAgent<IAppIpcContract>();

  const version = agent.sync.getVersionSync();
  console.log(`[page1] version`, { version });

  agent.subscribe('testEvent', (ev) => {
    console.log(`[page1] test event received: ${ev.type}`);
  });
}
