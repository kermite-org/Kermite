import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

export const FirmwareFlashPage: FC = () => (
  <div class={style}>
    <div class="panel">Device Connection Status</div>
    <div class="panel firmware-flash-panel">Flash Firmware</div>
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;

  > .panel {
    background: ${uiTheme.colors.clPanelBox};
    min-height: 250px;
    padding: 7px;
  }

  > .firmware-flash-panel {
    flex-grow: 1;
  }
  padding: 5px;
`;
