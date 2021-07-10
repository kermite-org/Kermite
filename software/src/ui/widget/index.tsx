import { jsx, css, FC } from 'qx';
import { siteModel } from '~/ui/common';
import { WidgetWindowActiveChrome } from '~/ui/widget/atoms/WidgetWindowActiveChrome';
import { WidgetWindowFrame } from '~/ui/widget/atoms/WidgetWindowFrame';
import { WidgetMainPanel } from '~/ui/widget/panels/WidgetMainPanel';

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
