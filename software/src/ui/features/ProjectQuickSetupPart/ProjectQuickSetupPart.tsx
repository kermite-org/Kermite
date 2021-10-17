import { css, FC, jsx, useEffect } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { DeviceAutoConnectionSection } from '~/ui/features/ProjectQuickSetupPart/sections/DeviceAutoConnectionSection/view';
import { FirmwareConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareConfigurationSection/view';
import { FirmwareFlashSection } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareFlashSection/view';
import { LayoutConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view';

function getCreateProfileButtonAvailability() {
  const { isConfigValid } = projectQuickSetupStore.state;
  return isConfigValid;
}

export const ProjectQuickSetupPart: FC = () => {
  useEffect(projectQuickSetupStore.effects.editDataPersistenceEffect, []);
  return (
    <div class={style}>
      <div class="top-row"></div>
      <div class="main-row">
        <FirmwareConfigurationSection class="firmware-config-section" />
        <LayoutConfigurationSection class="layout-config-section" />
      </div>
      <div class="bottom-row">
        <FirmwareFlashSection class="flash-section" />
        <DeviceAutoConnectionSection class="connection-section" />
        <div class="actions-section">
          <GeneralButton
            size="large"
            disabled={!getCreateProfileButtonAvailability()}
            onClick={projectQuickSetupStore.actions.createProfile}
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
    border: solid 1px ${uiTheme.colors.clPrimary};
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
      overflow-y: scroll;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    height: 80px;
    display: flex;
    justify-content: space-between;
    border: solid 1px ${uiTheme.colors.clPrimary};

    > .flash-section {
    }

    > .actions-section {
      padding: 10px;
    }
  }
`;
