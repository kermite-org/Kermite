/* eslint-disable @typescript-eslint/no-unused-vars */
import { applyGlobalStyle, css, FC, jsx, render, rerender } from 'alumina';
import { debounce } from '~/shared';
import { DeviceDevelopmentPage } from '~/web/DeviceDevelopmentPage';
import { OutlinePathDevelopmentPage } from './OutlinePathDevelopmentPage';

applyGlobalStyle(css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  #app {
    font-family: 'Roboto', sans-serif;
  }

  body {
    overflow: hidden;
    background: #fff;
  }
`);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function apiTest() {
  (async () => {
    const res = await fetch(
      'https://assets.kermite.org/krs/resources2/index.json',
    );
    const obj = await res.json();
    console.log({ obj });
  })();
}

const PageRoot: FC = () => {
  // useEffect(apiTest, []);
  return (
    <div>
      {/* <DeviceDevelopmentPage /> */}
      <OutlinePathDevelopmentPage />
    </div>
  );
};

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  render(() => <PageRoot />, appDiv);

  window.addEventListener('resize', debounce(rerender, 300));
  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
