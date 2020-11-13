import { css } from 'goober';
import { h } from '~lib/qx';
import { ITitleBarViewModel } from '~ui/viewModels/TitleBarViewModel';
import { WindowControlButton } from './WindowControlButton';
import { WindowRestartButton } from './WindowRestartButton';

export const WindowControlButtonsPart = ({
  vm
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
        qxOptimizer="deepEqual"
      />
      <WindowControlButton
        icon="fa fa-window-minimize"
        onClick={vm.onMinimizeButton}
        qxOptimizer="deepEqual"
      />
      <WindowControlButton
        icon="fa fa-window-maximize"
        onClick={vm.onMaximizeButton}
        qxOptimizer="deepEqual"
      />
      <WindowControlButton
        icon="fa fa-times"
        onClick={vm.onCloseButton}
        qxOptimizer="deepEqual"
      />
    </div>
  );
};
