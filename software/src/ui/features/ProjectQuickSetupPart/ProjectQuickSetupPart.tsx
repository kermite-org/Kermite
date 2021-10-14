import { css, FC, jsx } from 'qx';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';

export const ProjectQuickSetupPart: FC = () => (
  <div class={style}>
    <div class="top-row"></div>
    <div class="main-row">
      <SectionFrame
        title="Firmware Configuration"
        className="firmware-config-column"
      >
        aaa
      </SectionFrame>

      <SectionFrame
        title="Layout Configuration"
        className="layout-config-column"
      >
        bbb
      </SectionFrame>
    </div>
    <div class="bottom-row"></div>
  </div>
);

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  > .top-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 40px;
  }

  > .main-row {
    flex-grow: 1;
    display: flex;

    > .firmware-config-column {
      width: 55%;
      overflow: scroll;
    }
    > .layout-config-column {
      width: 45%;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 80px;
  }
`;
