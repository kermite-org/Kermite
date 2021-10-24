import { css, FC, jsx, useMemo } from 'qx';
import { uiTheme } from '~/ui/base';
import { ClosableOverlay } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { StandardFirmwareFlashPart } from '~/ui/pageContent/FirmwareFlashPageContent/parts/StandardFirmwareFlashPart/view';

export const FirmwareFlashPart: FC = () => {
  const { isFirmwareFlashPanelOpen } = projectQuickSetupStore.state;
  const {
    actions: { closeFirmwareFlashPanel },
  } = projectQuickSetupStore;

  const projectInfo = useMemo(
    projectQuickSetupStore.readers.emitDraftProjectInfo,
    [],
  );
  const firmwareVariationId = '01';
  return (
    <ClosableOverlay
      qxIf={isFirmwareFlashPanelOpen}
      close={closeFirmwareFlashPanel}
    >
      <div class={panelStyle}>
        <StandardFirmwareFlashPart
          projectInfo={projectInfo}
          firmwareVariationId={firmwareVariationId}
        />
      </div>
    </ClosableOverlay>
  );
};

const panelStyle = css`
  background: ${uiTheme.colors.clPanelBox};
  border: solid 1px ${uiTheme.colors.clPrimary};
`;
