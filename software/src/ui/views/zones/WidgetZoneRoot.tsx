import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';
import { WidgetWindowActiveChrome } from '~ui/views/layout/WidgetWindowActiveChrome';
import { MainPanel } from '~ui/views/pages/WidgetMainPage/WidgetMainPage';

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
      <WidgetWindowActiveChrome qxIf={models.siteModel.isWindowActive} />
      <MainPanel />
    </div>
  );
};
