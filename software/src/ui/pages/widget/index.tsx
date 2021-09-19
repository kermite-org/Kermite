import { css, FC, jsx } from 'qx';
import { WidgetWindowActiveChrome, WidgetWindowFrame } from '~/ui/components';
import { WidgetMainPanel } from '~/ui/pages/widget/panels/WidgetMainPanel';
import { siteModel } from '~/ui/store';

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
