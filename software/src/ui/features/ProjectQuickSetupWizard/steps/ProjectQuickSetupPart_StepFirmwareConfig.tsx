import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { WizardSectionPanel } from '~/ui/components/layouts';
import {
  ControllerPinAssignsSection,
  LayoutConfigurationSectionContent,
  ProjectKeyboardNameEditPart,
} from '~/ui/fabrics';
import { StandardFirmwareEditor } from '~/ui/featureEditors';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareConfig: FC = () => {
  projectQuickSetupStore.effects.useReflectEditFirmwareConfigToStore();
  const { layoutOptions, rawEditValues } = projectQuickSetupStore.state;
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
            title="Keys Preview"
            class="layout-config-section"
          >
            <LayoutConfigurationSectionContent
              firmwareConfig={rawEditValues}
              layoutOptions={layoutOptions}
              showLabels={false}
            />
          </WizardSectionPanel>
          <WizardSectionPanel
            title="Board Pin Assigns View"
            class="board-pin-assigns-section"
          >
            <ControllerPinAssignsSection firmwareConfig={rawEditValues} />
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
      display: flex;
      flex-direction: column;

      > .layout-config-section {
        height: 200px;
      }

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
