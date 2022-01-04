import { css, FC, jsx } from 'alumina';
import { WidgetControlButton } from '~/ui/components';
import { IWidgetMainPanelModel } from '~/ui/pages/WidgetPage/models/WidgetMainPanelModel';

type Props = {
  vm: IWidgetMainPanelModel;
};

export const WidgetControlButtonsBox: FC<Props> = ({ vm }) => (
  <div css={style}>
    <WidgetControlButton
      class="pinning-button"
      iconSpec="fa fa-thumbtack"
      isActive={vm.isWidgetAlwaysOnTop}
      onClick={vm.toggleWidgetAlwaysOnTop}
    />
    <WidgetControlButton
      class="config-button"
      iconSpec="exit_to_app"
      onClick={vm.backToConfiguratorView}
    />
  </div>
);

const style = css`
  display: flex;
  gap: 10px;
`;
