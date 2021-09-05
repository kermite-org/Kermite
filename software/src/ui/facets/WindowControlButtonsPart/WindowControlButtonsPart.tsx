import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import {
  WindowControlButton,
  WindowRestartButton,
} from '~/ui/components/window';
import { useWindowControlButtonsPartModel } from '~/ui/facets/WindowControlButtonsPart/WindowControlButtonsPart.model';
import { profilesReader } from '~/ui/pages/editor-page/models';

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
    <div css={style}>
      <WindowRestartButton handler={onReloadButton} qxIf={showReloadButton} />
      <WindowControlButton
        icon="fa fa-feather-alt"
        onClick={onWidgetButton}
        hint={texts.hint_titleBar_switchToWidgetView}
        disabled={!profilesReader.isEditProfileAvailable}
      />
      <WindowControlButton
        icon="fa fa-window-minimize"
        onClick={onMinimizeButton}
        hint={texts.hint_titleBar_minimizeWindow}
      />
      <WindowControlButton
        icon={
          !isWindowMaximized ? 'fa fa-window-maximize' : 'fa fa-window-restore'
        }
        onClick={onMaximizeButton}
        hint={texts.hint_titleBar_maximizeWindow}
      />
      <WindowControlButton
        icon="fa fa-times"
        onClick={onCloseButton}
        hint={texts.hint_titleBar_closeApplication}
      />
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;
  height: 100%;
`;
