import { css, FC, jsx } from 'qx';
import { GeneralButton } from '~/ui/components';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { DeviceAutoConnectionSection } from '~/ui/features/ProjectQuickSetupPart/sections/DeviceAutoConnectionSection';
import { FirmwareConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareConfigurationSection';
import { FirmwareFlashSection } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareFlashSection';

function getCreateProfileButtonAvailability() {
  const { isConfigValid, isConnectionValid } = projectQuickSetupStore.state;
  return isConfigValid && isConnectionValid;
}

export const ProjectQuickSetupPart: FC = () => {
  return (
    <div class={style}>
      <div class="top-row"></div>
      <div class="main-row">
        <FirmwareConfigurationSection class="firmware-config-section" />
        <SectionFrame
          title="Layout Configuration"
          class="layout-config-section"
        >
          bbb
        </SectionFrame>
      </div>
      <div class="bottom-row">
        <FirmwareFlashSection class="flash-section" />
        <DeviceAutoConnectionSection class="connection-section" />
        <div class="actions-section">
          <GeneralButton
            size="large"
            disabled={!getCreateProfileButtonAvailability()}
          >
            Create Profile
          </GeneralButton>
        </div>
      </div>
    </div>
  );
};

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

    > .firmware-config-section {
      width: 55%;
      overflow-y: scroll;
    }
    > .layout-config-section {
      width: 45%;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    border: solid 1px red;
    height: 80px;
    display: flex;
    justify-content: space-between;

    > .flash-section {
    }

    > .actions-section {
      padding: 10px;
    }
  }
`;
