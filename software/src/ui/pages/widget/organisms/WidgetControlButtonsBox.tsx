import { css, FC, jsx } from 'qx';
import { WidgetControlButton } from '~/ui/components';
import { IWidgetMainPanelModel } from '~/ui/pages/widget/models/WidgetMainPanelModel';

type Props = {
  className?: string;
  vm: IWidgetMainPanelModel;
};

export const WidgetControlButtonsBox: FC<Props> = ({ vm, className }) => (
  <div css={style} className={className}>
    <WidgetControlButton
      className="pinning-button"
      iconSpec="fa fa-thumbtack"
      isActive={vm.isWidgetAlwaysOnTop}
      onClick={vm.toggleWidgetAlwaysOnTop}
    />
    <WidgetControlButton
      className="config-button"
      iconSpec="exit_to_app"
      onClick={vm.backToConfiguratorView}
    />
  </div>
);

const style = css`
  display: flex;
  gap: 10px;
`;
