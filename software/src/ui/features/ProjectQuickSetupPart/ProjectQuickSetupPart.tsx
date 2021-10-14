import { css, FC, jsx } from 'qx';
import {
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { StandardFirmwareEditor } from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';

const state = new (class {
  firmwareConfig: IKermiteStandardKeyboardSpec = fallbackStandardKeyboardSpec;
})();

export const ProjectQuickSetupPart: FC = () => (
  <div class={style}>
    <div class="top-row"></div>
    <div class="main-row">
      <SectionFrame
        title="Firmware Configuration"
        class="firmware-config-column"
      >
        <StandardFirmwareEditor
          firmwareConfig={state.firmwareConfig}
          isNewConfig={true}
        />
      </SectionFrame>

      <SectionFrame title="Layout Configuration" class="layout-config-column">
        bbb
      </SectionFrame>
    </div>
    <div class="bottom-row">
      <div class="flash-column">ddd</div>
      <div class="connection-column">eee</div>
      <div class="actions-column">fff</div>
    </div>
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .top-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 40px;
  }

  > .main-row {
    height: 0;
    flex-grow: 1;
    display: flex;

    > .firmware-config-column {
      width: 55%;
      overflow-y: scroll;
    }
    > .layout-config-column {
      width: 45%;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 120px;
    display: flex;
    justify-content: space-between;
    > * {
      border: solid 1px green;
    }
  }
`;
