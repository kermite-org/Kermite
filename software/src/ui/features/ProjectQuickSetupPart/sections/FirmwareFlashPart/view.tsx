import { css, FC, jsx, useEffect } from 'qx';
import { uiTheme } from '~/ui/base';
import { ClosableOverlay } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { standardFirmwareFlashPartModel_configure } from '~/ui/pageContent/FirmwareFlashPageContent/parts/StandardFirmwareFlashPart/model';
import { StandardFirmwareFlashPart } from '~/ui/pageContent/FirmwareFlashPageContent/parts/StandardFirmwareFlashPart/view';

export const FirmwareFlashPart: FC = () => {
  const { isFirmwareFlashPanelOpen } = projectQuickSetupStore.state;
  const {
    actions: { closeFirmwareFlashPanel },
  } = projectQuickSetupStore;
  useEffect(() => {
    const projectInfo = projectQuickSetupStore.readers.emitDraftProjectInfo();
    const firmwareVariationId = '01';
    standardFirmwareFlashPartModel_configure(projectInfo, firmwareVariationId);
  }, []);
  return (
    <ClosableOverlay
      qxIf={isFirmwareFlashPanelOpen}
      close={closeFirmwareFlashPanel}
    >
      <div class={panelStyle}>
        <StandardFirmwareFlashPart />
      </div>
    </ClosableOverlay>
  );
};

const panelStyle = css`
  background: ${uiTheme.colors.clPanelBox};
  border: solid 1px ${uiTheme.colors.clPrimary};
`;
