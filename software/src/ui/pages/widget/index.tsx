import { jsx, css, FC } from 'qx';
import { WidgetWindowActiveChrome } from '~/ui/pages/widget/atoms/WidgetWindowActiveChrome';
import { WidgetWindowFrame } from '~/ui/pages/widget/atoms/WidgetWindowFrame';
import { WidgetMainPanel } from '~/ui/pages/widget/panels/WidgetMainPanel';
import { siteModel } from '~/ui/sharedModels';

export const WidgetZoneRoot: FC = () => {
  return (
    <div css={style}>
      <WidgetWindowFrame>
        <WidgetMainPanel />
      </WidgetWindowFrame>
      <WidgetWindowActiveChrome qxIf={siteModel.isWindowActive} />
    </div>
  );
};

const style = css`
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
`;
