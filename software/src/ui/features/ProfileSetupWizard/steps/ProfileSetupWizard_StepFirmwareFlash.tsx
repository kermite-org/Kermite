import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { colors, IFirmwareVariationSelectorItem } from '~/ui/base';
import { getFirmwareTargetDeviceType } from '~/ui/commonModels';
import { WizardSectionPanelWithCenterContent } from '~/ui/components/layouts';
import {
  DeviceAutoConnectionPart,
  StandardFirmwareFlashPart,
} from '~/ui/fabrics';
import { FirmwareVariationSelector } from '~/ui/fabrics/FirmwareVariationSelector/view';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';

type IFirmwareFlashStepModel = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
  variationSelectorItems: IFirmwareVariationSelectorItem[];
  setVariationId: (value: string) => void;
};

function useFirmwareFlashStepModel(): IFirmwareFlashStepModel {
  const { variationId } = profileSetupStore.state;
  const { setVariationId } = profileSetupStore.actions;

  const { targetProjectInfo: projectInfo } = profileSetupStore.readers;

  const variationSelectorItems = projectInfo.firmwares.map((it) => ({
    variationId: it.variationId,
    variationName: it.firmwareName,
    mcuType: getFirmwareTargetDeviceType(projectInfo, it.variationId)!,
  }));
  return {
    projectInfo,
    variationId,
    variationSelectorItems,
    setVariationId,
  };
}

export const ProfileSetupWizard_StepFirmwareFlash: FC = () => {
  const { projectInfo, variationId, variationSelectorItems, setVariationId } =
    useFirmwareFlashStepModel();
  return (
    <div class={style}>
      <div class="top-row">
        <div class="label">Firmware Variation</div>
        <FirmwareVariationSelector
          items={variationSelectorItems}
          variationId={variationId}
          setVariationId={setVariationId}
          class="selector"
        />
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

    > .selector {
      margin-top: 5px;
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
