import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/ui-root/models';
import { WidgetWindowActiveChrome } from '~/ui-root/views/base/window/WidgetWindowActiveChrome';
import { MainPanel } from '~/ui-root/views/pages/WidgetMainPage';

const cssWidgetZoneRoot = css`
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;

  &[data-window-active] {
  }
`;

export const WidgetZoneRoot = () => {
  return (
    <div css={cssWidgetZoneRoot}>
      <WidgetWindowActiveChrome qxIf={models.siteModel.isWindowActive} />
      <MainPanel />
    </div>
  );
};
