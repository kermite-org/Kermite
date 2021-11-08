import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { colors, ISelectorSource } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { WizardSectionPanelWithCenterContent } from '~/ui/components/layouts';
import { DeviceAutoConnectionPart } from '~/ui/fabrics/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/fabrics/StandardFirmwareFlashPart/view';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';

type IFirmwareFlashStepModel = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
  variationSelectorSource: ISelectorSource;
};

function useFirmwareFlashStepModel(): IFirmwareFlashStepModel {
  const { variationId } = profileSetupStore.state;
  const { setVariationId } = profileSetupStore.actions;

  const { targetProjectInfo: projectInfo } = profileSetupStore.readers;

  const variationSelectorSource = {
    options: projectInfo.firmwares.map((it) => ({
      value: it.variationId,
      label: it.firmwareName,
    })),
    value: variationId,
    setValue: setVariationId,
  };
  return {
    projectInfo,
    variationId,
    variationSelectorSource,
  };
}

export const ProfileSetupWizard_StepFirmwareFlash: FC = () => {
  const { projectInfo, variationId, variationSelectorSource } =
    useFirmwareFlashStepModel();
  return (
    <div class={style}>
      <div class="top-row">
        <div class="label">Firmware Variation</div>
        <GeneralSelector {...variationSelectorSource} width={150} />
      </div>
      <div class="main-row">
        <WizardSectionPanelWithCenterContent
          title="Device Connection Status"
          class="connection-panel"
          contentWidth={450}
          contentHeight={400}
        >
          <DeviceAutoConnectionPart
            projectInfo={projectInfo}
            variationId={variationId}
          />
        </WizardSectionPanelWithCenterContent>
        <WizardSectionPanelWithCenterContent
          title="Flash Firmware"
          class="flash-panel"
          contentWidth={400}
          contentHeight={400}
        >
          <StandardFirmwareFlashPart
            projectInfo={projectInfo}
            variationId={variationId}
          />
        </WizardSectionPanelWithCenterContent>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  background-color: ${colors.clPanelBox};
  display: flex;
  flex-direction: column;

  > .top-row {
    border: solid 1px ${colors.clPrimary};
    flex-shrink: 0;
    padding: 10px;
    display: flex;
    align-items: center;

    > .label {
      margin-right: 10px;
    }
  }

  > .main-row {
    flex-grow: 1;
    display: flex;

    > div {
      flex-grow: 1;
    }
  }
`;
