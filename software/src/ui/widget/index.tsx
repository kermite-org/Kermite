import { jsx, css, FC } from 'qx';
import { siteModel } from '~/ui/common';
import { WidgetWindowActiveChrome } from '~/ui/widget/components';
import { WidgetWindowFrame } from '~/ui/widget/components/WidgetWindowFrame';
import { WidgetMainPanel } from '~/ui/widget/views/WidgetMainPanel';

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
