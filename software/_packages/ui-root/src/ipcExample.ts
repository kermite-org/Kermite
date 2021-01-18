import { getIpcRendererAgent, IAppIpcContract } from '~/shared';

export async function ipcExample() {
  const agent = getIpcRendererAgent<IAppIpcContract>();

  const versionA = agent.sync.dev_getVersionSync();
  const versionB = await agent.async.dev_getVersion();
  const value = await agent.async.dev_addNumber(100, 200);
  console.log({ versionA, versionB, value });

  agent.subscribe('dev_testEvent', (ev) => {
    console.log(`test event received: ${ev.type}`);
  });
}
