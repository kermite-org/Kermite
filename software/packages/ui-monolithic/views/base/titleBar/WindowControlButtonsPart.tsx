import { css } from 'goober';
import { h } from 'qx';
import { ITitleBarViewModel } from '~/viewModels/TitleBarViewModel';
import { WindowControlButton } from './WindowControlButton';
import { WindowRestartButton } from './WindowRestartButton';

export const WindowControlButtonsPart = ({
  vm,
}: {
  vm: ITitleBarViewModel;
}) => {
  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  return (
    <div css={cssButtonsBox}>
      <WindowRestartButton
        handler={vm.onReloadButton}
        qxIf={vm.showReloadButton}
      />
      <WindowControlButton
        icon="fa fa-feather-alt"
        onClick={vm.onWidgetButton}
      />
      <WindowControlButton
        icon="fa fa-window-minimize"
        onClick={vm.onMinimizeButton}
      />
      <WindowControlButton
        icon="fa fa-window-maximize"
        onClick={vm.onMaximizeButton}
      />
      <WindowControlButton icon="fa fa-times" onClick={vm.onCloseButton} />
    </div>
  );
};
