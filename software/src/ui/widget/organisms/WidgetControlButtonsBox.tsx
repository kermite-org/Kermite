import { css, FC, jsx } from 'qx';
import { WidgetControlButton } from '~/ui/widget/atoms/WidgetControlButton';
import { IWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';

interface Props {
  className?: string;
  vm: IWidgetMainPanelModel;
}

export const WidgetControlButtonsBox: FC<Props> = ({ vm, className }) => {
  return (
    <div css={style} className={className}>
      <WidgetControlButton
        className="pinning-button"
        iconSpec="fa fa-thumbtack"
        isActive={vm.isWidgetAlwaysOnTop}
        onClick={vm.toggleWidgetAlwaysOnTop}
      />
      <WidgetControlButton
        className="config-button"
        iconSpec="fa fa-window-restore"
        onClick={vm.backToConfiguratorView}
      />
    </div>
  );
};

const style = css`
  display: flex;
  gap: 10px;
`;
