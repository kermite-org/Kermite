import { css, FC, jsx } from 'qx';
import { siteModel } from '~/ui/commonModels';
import {
  WidgetWindowActiveChrome,
  WidgetWindowFrame,
} from '~/ui/components_widget/atoms';
import { WidgetMainPanel } from '~/ui/pages/widget/panels/WidgetMainPanel';

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
