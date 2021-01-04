import { getIpcRendererAgent, IAppIpcContract } from '@kermite/shared';

export async function ipcExample() {
  const agent = getIpcRendererAgent<IAppIpcContract>();

  const version = agent.sync.dev_getVersionSync();
  console.log(`[page1] version`, { version });

  agent.subscribe('dev_testEvent', (ev) => {
    console.log(`[page1] test event received: ${ev.type}`);
  });

  async function loadProfile() {
    const curProf = await agent.async.profile_getCurrentProfile();
    console.log({ curProf });
  }

  loadProfile();

  agent.subscribe('profile_currentProfileChanged', () => {
    console.log('profile changed');
    loadProfile();
  });
}
