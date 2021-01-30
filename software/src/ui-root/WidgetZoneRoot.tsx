import { css } from 'goober';
import { h } from 'qx';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';
import { WidgetWindowActiveChrome } from '~/ui-root/zones/siteFrame/views/window/WidgetWindowActiveChrome';
import { MainPanel } from '~/ui-root/zones/widget/WidgetMainPage';

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
      <WidgetWindowActiveChrome qxIf={siteModel.isWindowActive} />
      <MainPanel />
    </div>
  );
};
