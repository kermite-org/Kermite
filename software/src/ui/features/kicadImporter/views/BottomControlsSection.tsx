import { css, domStyled, FC, jsx } from 'alumina';
import { GeneralButton } from '~/ui/components';
import { kicadImporterStore } from '../store';

export const BottomControlsSection: FC = () => {
  const { loadKicadPcbFile, exportJson } = kicadImporterStore.actions;
  return domStyled(
    <div>
      <GeneralButton onClick={loadKicadPcbFile} text="load file (.kicad_pcb)" />
      <GeneralButton text="apply layout" onClick={exportJson} />
    </div>,
    css`
      display: flex;
      gap: 15px;
    `,
  );
};
