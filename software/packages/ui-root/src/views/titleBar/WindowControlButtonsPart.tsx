import { css } from 'goober';
import { h } from 'qx';
import { makeWindowControlButtonsModel } from '~/views/titleBar/WindowControlButtonsPart.model';
import { WindowControlButton } from '~/views/titleBar/elements/WindowControlButton';

export const WindowControlButtonsPart = () => {
  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  const vm = makeWindowControlButtonsModel();

  return (
    <div css={cssButtonsBox}>
      {/* <WindowRestartButton
        handler={vm.onReloadButton}
        qxIf={vm.showReloadButton}
      /> */}
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
