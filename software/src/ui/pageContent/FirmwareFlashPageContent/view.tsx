import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { uiTheme } from '~/ui/base';
import { useDeviceAutoConnectionEffects } from '~/ui/pageContent/FirmwareFlashPageContent/hooks';
import { DeviceAutoConnectionPart } from '~/ui/pageContent/FirmwareFlashPageContent/parts/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/pageContent/FirmwareFlashPageContent/parts/StandardFirmwareFlashPart/view';
import { firmwareFlashPageContentStore } from '~/ui/pageContent/FirmwareFlashPageContent/store';

type Props = {
  projectInfo: IProjectPackageInfo;
  fixedFirmwareVariationId: string | undefined;
};

export const FirmwareFlashPageContent: FC<Props> = ({
  projectInfo,
  fixedFirmwareVariationId,
}) => {
  firmwareFlashPageContentStore.effects.useConfigureStore(
    projectInfo,
    fixedFirmwareVariationId,
  );
  useDeviceAutoConnectionEffects();
  const firmwareVariationId = fixedFirmwareVariationId!; // todo: use by selector
  return (
    <div class={style}>
      <div class="row first-row">
        <div class="panel device-connection-panel">
          <h2>Device Connection Status</h2>
          <DeviceAutoConnectionPart />
        </div>
        <div class="panel keystate-preview-panel">
          <h2>KeyState Preview</h2>
        </div>
      </div>
      <div class="row second-row">
        <div class="panel firmware-flash-panel">
          <h2>Flash Firmware</h2>
          <StandardFirmwareFlashPart
            projectInfo={projectInfo}
            firmwareVariationId={firmwareVariationId}
          />
        </div>
        <div class="panel parameters-panel">
          <h2>Parameters</h2>
        </div>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;

  > .row {
    display: flex;
    gap: 5px;

    &.first-row {
      min-height: 250px;
    }

    &.second-row {
      flex-grow: 1;
    }

    > .panel {
      background: ${uiTheme.colors.clPanelBox};
      padding: 7px;

      &.device-connection-panel {
        width: 50%;
      }

      &.keystate-preview-panel {
        width: 50%;
      }

      &.firmware-flash-panel {
        width: 55%;
      }

      &.parameters-panel {
        width: 45%;
      }
    }
  }

  padding: 5px;
`;
