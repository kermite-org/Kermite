import { applyGlobalStyle, css, FC, jsx, render, rerender } from 'qx';
import { debounce } from '~/shared';
import { DeviceDevelopmentPage } from '~/web/DeviceDevelopmentPage';

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

const PageRoot: FC = () => {
  return (
    <div>
      <DeviceDevelopmentPage />
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
