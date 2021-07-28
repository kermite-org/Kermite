import { css, jsx } from 'qx';
import { texts } from '~/ui/base';
import {
  WindowControlButton,
  WindowRestartButton,
} from '~/ui/components/window';
import { makeWindowControlButtonsModel } from '~/ui/root/views/titleBar/WindowControlButtonsPart.model';

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
        hint={texts.hint_titleBar_switchToWidgetView}
      />
      <WindowControlButton
        icon="fa fa-window-minimize"
        onClick={vm.onMinimizeButton}
        hint={texts.hint_titleBar_minimizeWindow}
      />
      <WindowControlButton
        icon={
          !vm.isWindowMaximized
            ? 'fa fa-window-maximize'
            : 'fa fa-window-restore'
        }
        onClick={vm.onMaximizeButton}
        hint={texts.hint_titleBar_maximizeWindow}
      />
      <WindowControlButton
        icon="fa fa-times"
        onClick={vm.onCloseButton}
        hint={texts.hint_titleBar_closeApplication}
      />
    </div>
  );
};
