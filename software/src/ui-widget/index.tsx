import { h } from 'qx';
import { css } from 'qx/cssinjs';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';
import { MainPanel } from '~/ui-widget/WidgetMainPage';
import { WidgetWindowActiveChrome } from '~/ui-widget/WidgetWindowActiveChrome';

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
