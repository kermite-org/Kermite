import { css } from 'goober';
import { h } from 'qx';
import { makeWindowControlButtonsModel } from '~/ui-root/views/titleBar/WindowControlButtonsPart.model';
import { WindowControlButton } from './elements/WindowControlButton';
import { WindowRestartButton } from './elements/WindowRestartButton';

export const WindowControlButtonsPart = () => {
  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  const vm = makeWindowControlButtonsModel();

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
