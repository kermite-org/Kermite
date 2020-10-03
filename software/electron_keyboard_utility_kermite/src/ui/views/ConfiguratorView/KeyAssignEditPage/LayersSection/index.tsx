import { css } from 'goober';
import { h } from '~lib/qx';
import { LayerManagementPart } from './LayerManagementPart';
import { LayersListBoxPart } from './LayersListBoxPart';

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
