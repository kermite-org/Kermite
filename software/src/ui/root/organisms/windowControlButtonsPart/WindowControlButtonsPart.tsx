import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import {
  WindowControlButton,
  WindowRestartButton,
} from '~/ui/components/window';
import { profilesReader } from '~/ui/pages/assignerPage/models';
import { useWindowControlButtonsPartModel } from '~/ui/root/organisms/windowControlButtonsPart/windowControlButtonsPart.model';

export const WindowControlButtonsPart: FC = () => {
  const {
    showReloadButton,
    onReloadButton,
    onWidgetButton,
    onMinimizeButton,
    onMaximizeButton,
    isWindowMaximized,
    onCloseButton,
  } = useWindowControlButtonsPartModel();
  return (
    <div class={style}>
      <WindowRestartButton handler={onReloadButton} if={showReloadButton} />
      <WindowControlButton
        icon="fa fa-feather-alt"
        onClick={onWidgetButton}
        hint={texts.titleBarHint.switchToWidgetView}
        disabled={!profilesReader.isEditProfileAvailable}
      />
      <WindowControlButton
        icon="fa fa-window-minimize"
        onClick={onMinimizeButton}
        hint={texts.titleBarHint.minimizeWindow}
      />
      <WindowControlButton
        icon={
          !isWindowMaximized ? 'fa fa-window-maximize' : 'fa fa-window-restore'
        }
        onClick={onMaximizeButton}
        hint={texts.titleBarHint.maximizeWindow}
      />
      <WindowControlButton
        icon="fa fa-times"
        onClick={onCloseButton}
        hint={texts.titleBarHint.closeApplication}
      />
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;
  height: 100%;
`;
