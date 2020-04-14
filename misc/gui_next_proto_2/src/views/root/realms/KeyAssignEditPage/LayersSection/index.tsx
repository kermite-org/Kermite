import { css } from 'goober';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';
import { hx } from '~views/basis/qx';

function LayerSectionHeaderPart() {
  const cssSectionHeader = css`
    padding: 6px;
  `;
  return <div css={cssSectionHeader}>Layers</div>;
}

export function LayersSection() {
  return (
    <div>
      <LayerSectionHeaderPart />
      <LayersListBoxPart />
      <LayerManagementPart />
    </div>
  );
}
