import {
  addNumber,
  getIpcRendererAgent,
  IAppIpcContract,
  IProfileData,
  showVersion,
} from '@kermite/shared';
import { initializeCss, ipcAgent } from '@kermite/ui';
import { css } from 'goober';
import { h, render, Hook, rerender } from 'qx';
import { ProfileSelector } from '~/ProfileSelector';
import { ipcExample } from '~/ipcExample';
import { greet } from '~/local';

const cssRoot = css`
  border: solid 4px orange;
  height: 100%;
`;

let renderIndex = 0;

let broken = false;

const Counter1 = () => {
  const ri = renderIndex;

  const [count, setCount] = Hook.useState(0);

  const [value, setValue] = Hook.useState(0);

  Hook.useEffect(() => {
    console.log(`step3 ${count}`);
    setValue(count * 2);
    return true;
  }, [(count / 3) >> 0]);

  Hook.useEffect(() => {
    console.log(`effect ${count} ${ri}`);

    return () => {
      console.log(`cleanup ${count} ${ri}`);
    };
  }, [(count / 3) >> 0]);

  return (
    <div>
      <div>count: {count}</div>
      <div>value: {value}</div>
      <div>
        <button onClick={() => setCount(count + 1)}>inc</button>
        <button onClick={() => setCount(0)}>reset</button>
      </div>
    </div>
  );
};

const agent = getIpcRendererAgent<IAppIpcContract>();
agent.setPropsProcessHook(rerender);

let gProfile: IProfileData | undefined;
let gVersion = '';

const cssJsonDiv = css`
  font-size: 3px;
`;

const ProfileView = () => {
  Hook.useEffect(() => {
    const unsub = agent.subscribe('profile_currentProfile', (profile) => {
      console.log('profile loaded');
      console.log({ profile });
      gProfile = profile;
      // rerender();
    });
    return () => {
      agent.sync.dev_debugMessage('subscription cleaned');
      unsub();
    };
  }, []);

  Hook.useEffect(() => {
    (async () => {
      gVersion = await agent.async.dev_getVersion();
    })();
  }, []);

  return (
    <div>
      <div> {gVersion}</div>
      <div css={cssJsonDiv}>{JSON.stringify(gProfile)}</div>
    </div>
  );
};

const ActiveChecker = () => {
  const [isActive, setActive] = Hook.useState(true);

  Hook.useEffect(() => {
    ipcAgent.subscribe('window_appWindowEvents', (ev) => {
      if (ev.activeChanged !== undefined) {
        setActive(ev.activeChanged);
      }
    });
  }, []);

  return <div>isActive: {isActive.toString()}</div>;
};

const PageRoot = () => {
  renderIndex++;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const b = Hook.useMemo(() => 100, []);

  if (broken) {
    return <div />;
    // return null; // 子階層のvdomがunmountされない
  }

  return (
    <div css={cssRoot}>
      hello page1
      <Counter1 />
      <ActiveChecker />
      <ProfileView />
      <div>
        <button onClick={() => (broken = true)}>break</button>
      </div>
      <ProfileSelector />
    </div>
  );
};

window.addEventListener('load', () => {
  initializeCss();

  console.log('hello');
  const c = addNumber(100, 200);
  console.log({ c });
  showVersion();
  greet();
  document.body.style.background = '#FFF';

  ipcExample();

  render(() => <PageRoot />, document.getElementById('app'));
});

window.addEventListener('beforeunload', () => {
  console.log('beforeunload');
  render(() => <div />, document.getElementById('app'));
});
