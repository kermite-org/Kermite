import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { ControllerPinAssignsSection } from '~/ui/features/ProjectQuickSetupPart/sections/ControllerPinAssignsSection/view';
import { DeviceAutoConnectionSection } from '~/ui/features/ProjectQuickSetupPart/sections/DeviceAutoConnectionSection/view';
import { FirmwareConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareConfigurationSection/view';
import { FirmwareFlashPanel } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareFlashPanel/view';
import { LayoutConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view';
import { ProjectConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/ProjectConfigurationSection/view';

const FirmwareFlashPanelButton: FC = () => {
  const { isConfigValid } = projectQuickSetupStore.state;
  return (
    <GeneralButton
      size="large"
      disabled={!isConfigValid}
      onClick={projectQuickSetupStore.actions.openFirmwareFlashPanel}
    >
      Flash Firmware
    </GeneralButton>
  );
};

const CreateProfileButton: FC = () => {
  const { isConfigValid } = projectQuickSetupStore.state;
  return (
    <GeneralButton
      size="large"
      disabled={!isConfigValid}
      onClick={projectQuickSetupStore.actions.createProfile}
    >
      Create Profile
    </GeneralButton>
  );
};

export const ProjectQuickSetupPart: FC = () => {
  projectQuickSetupStore.executeEffectsOnRender();
  return (
    <div class={style}>
      <div class="top-row">
        <ProjectConfigurationSection />
      </div>
      <div class="main-row">
        <FirmwareConfigurationSection class="firmware-config-section" />
        <div class="right-column">
          <LayoutConfigurationSection class="layout-config-section" />
          <ControllerPinAssignsSection />
        </div>
      </div>
      <div class="bottom-row">
        <FirmwareFlashPanelButton />
        <DeviceAutoConnectionSection class="connection-section" />
        <CreateProfileButton />
      </div>
      <FirmwareFlashPanel />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .top-row {
    flex-shrink: 0;
  }

  > .main-row {
    height: 0;
    flex-grow: 1;
    display: flex;

    > .firmware-config-section {
      width: 55%;
      overflow-y: scroll;
    }
    > .right-column {
      width: 45%;
      overflow-y: scroll;
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    height: 80px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: solid 1px ${uiTheme.colors.clPrimary};
  }
`;
