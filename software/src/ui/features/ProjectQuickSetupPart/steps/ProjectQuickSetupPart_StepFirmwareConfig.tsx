import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { WizardSectionPanel } from '~/ui/components/layouts';
import { StandardFirmwareEditor } from '~/ui/editors';
import { ControllerPinAssignsSection } from '~/ui/fabrics/ControllerPinAssignsSection/view';
import { LayoutConfigurationSectionContent } from '~/ui/fabrics/LayoutConfigurationSection/view';
import { ProjectKeyboardNameEditPart } from '~/ui/fabrics/ProjectKeyboardNameEditPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareConfig: FC = () => {
  projectQuickSetupStore.effects.useReflectEditFirmwareConfigToStore();
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  const { resetConfigurations } = projectQuickSetupStore.actions;
  const { keyboardName } = projectQuickSetupStore.state;
  const { keyboardNameValidationError } = projectQuickSetupStore.readers;
  const { setKeyboardName } = projectQuickSetupStore.actions;
  return (
    <div class={style}>
      <div class="top-row">
        <ProjectKeyboardNameEditPart
          keyboardName={keyboardName}
          setKeyboardName={setKeyboardName}
          validationError={keyboardNameValidationError}
        />
        <GeneralButton onClick={resetConfigurations}>reset</GeneralButton>
      </div>
      <div class="main-row">
        <WizardSectionPanel
          title="Firmware Configuration"
          class="firmware-config-section"
        >
          <StandardFirmwareEditor />
        </WizardSectionPanel>
        <div class="right-column">
          <WizardSectionPanel
            title="Layout Preview"
            class="layout-config-section"
            qxIf={false}
          >
            <LayoutConfigurationSectionContent
              firmwareConfig={firmwareConfig}
              layoutOptions={layoutOptions}
            />
          </WizardSectionPanel>
          <WizardSectionPanel
            title="Board Pin Assigns View"
            class="board-pin-assigns-section"
          >
            <ControllerPinAssignsSection firmwareConfig={firmwareConfig} />
          </WizardSectionPanel>
        </div>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.clPanelBox};

  > .top-row {
    flex-shrink: 0;
    border: solid 1px ${colors.clPrimary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
  }

  > .main-row {
    height: 0;
    flex-grow: 1;
    display: flex;

    > .firmware-config-section {
      flex-grow: 1;
      overflow-y: scroll;
    }
    > .right-column {
      width: 40%;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;

      > .board-pin-assigns-section {
        flex-grow: 1;
      }
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    height: 80px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: solid 1px ${colors.clPrimary};
  }
`;
