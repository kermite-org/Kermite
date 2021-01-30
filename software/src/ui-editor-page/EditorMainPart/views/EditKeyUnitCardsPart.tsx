import { h } from 'qx';
import { PlayerModel } from '~/ui-common/sharedModels/PlayerModel';
import { makeKeyUnitCardsPartViewModel } from '~/ui-editor-page/EditorMainPart/viewModels/KeyUnitCardsPartViewModel';
import { EditKeyUnitCard } from './EditKeyUnitCard';

export function EditKeyUnitCardsPart(props: { playerModel: PlayerModel }) {
  const vm = makeKeyUnitCardsPartViewModel(props.playerModel);
  return (
    <g>
      {vm.cards.map((keyUnit) => (
        <EditKeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          showLayerDefaultAssign={vm.showLayerDefaultAssign}
          // qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
