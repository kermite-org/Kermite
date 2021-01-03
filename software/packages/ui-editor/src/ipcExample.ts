import { getIpcRendererAgent, IAppIpcContract } from '@kermite/shared';

export async function ipcExample() {
  const agent = getIpcRendererAgent<IAppIpcContract>();

  const versionA = agent.sync.getVersionSync();
  const versionB = await agent.async.getVersion();
  const value = await agent.async.addNumber(100, 200);
  console.log({ versionA, versionB, value });

  agent.subscribe('testEvent', (ev) => {
    console.log(`test event received: ${ev.type}`);
  });
}
