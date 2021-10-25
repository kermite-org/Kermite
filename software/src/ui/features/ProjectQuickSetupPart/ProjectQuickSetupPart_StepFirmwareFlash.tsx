import { css, FC, jsx, QxChildren, useMemo } from 'qx';
import { uiTheme } from '~/ui/base';
import { DeviceAutoConnectionPart } from '~/ui/fabrics/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/fabrics/StandardFirmwareFlashPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { LayoutConfigurationSectionRawContent } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view2';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';

const SectionPanel: FC<{ title: string; children?: QxChildren }> = ({
  title,
  children,
}) => {
  const style = css`
    background: ${uiTheme.colors.clPanelBox};
    padding: 7px;
    border: solid 1px ${uiTheme.colors.clPrimary};

    > h2 {
      font-size: 16px;
    }
    overflow-y: auto;
  `;
  return (
    <div class={style}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [],
  );
  const firmwareVariationId = '01';
  return (
    <div class={style}>
      <div class="row first-row">
        <SectionPanel
          title="Device Connection Status"
          class="device-connection-panel"
        >
          <DeviceAutoConnectionPart
            projectInfo={projectInfo}
            firmwareVariationId={firmwareVariationId}
          />
        </SectionPanel>
        <SectionPanel title="Layout Preview" class="layout-config-panel">
          <LayoutConfigurationSectionRawContent class="layout-view" />
          <LayoutGeneratorOptionsPart class="options-part" />
        </SectionPanel>
      </div>
      <div class="row second-row">
        <SectionPanel title="Flash Firmware" class="firmware-flash-panel">
          <StandardFirmwareFlashPart
            projectInfo={projectInfo}
            firmwareVariationId={firmwareVariationId}
          />
        </SectionPanel>
        <SectionPanel
          title="Parameters"
          class="panel parameters-panel"
        ></SectionPanel>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .row {
    display: flex;

    &.first-row {
      min-height: 40%;
    }

    &.second-row {
      flex-grow: 1;
    }

    > .device-connection-panel {
      width: 50%;
    }

    > .layout-config-panel {
      width: 50%;

      > .layout-view {
        margin-top: 5px;
        height: 200px;
      }

      > .options-part {
        margin-top: 15px;
      }
    }

    > .firmware-flash-panel {
      width: 55%;
    }

    > .parameters-panel {
      width: 45%;
    }
  }
`;
