import { jsx, css } from 'qx';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';
import { WidgetMainPanel } from '~/ui-widget/views/WidgetMainPanel';
import { WidgetWindowActiveChrome } from '~/ui-widget/views/WidgetWindowActiveChrome';

const style = css`
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
`;

export const WidgetZoneRoot = () => {
  return (
    <div css={style}>
      <WidgetWindowActiveChrome qxIf={siteModel.isWindowActive} />
      <WidgetMainPanel />
    </div>
  );
};
