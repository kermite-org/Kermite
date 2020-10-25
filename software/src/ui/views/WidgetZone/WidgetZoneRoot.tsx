import { css } from 'goober';
import { h } from '~lib/qx';
import { siteModel } from '~ui/models';
import { WindowActiveChrome } from './layout/WindowActiveChrome';
import { MainPanel } from './pages/MainPage';

export const WidgetZoneRoot = () => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;

    &[data-window-active] {
    }
  `;

  return (
    <div css={cssRoot}>
      <WindowActiveChrome qxIf={siteModel.isWindowActive} />
      <MainPanel />
    </div>
  );
};
