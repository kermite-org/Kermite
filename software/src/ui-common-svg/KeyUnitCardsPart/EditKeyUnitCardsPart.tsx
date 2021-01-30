import { h } from 'qx';
import {
  IEditorModel,
  IPlayerModel,
  makeEditKeyUnitCardsPartViewModel,
} from '~/ui-common-svg/KeyUnitCardsPart/EditKeyUnitCardsPartViewModel';
import { EditKeyUnitCard } from '../KeyUnitCards/EditKeyUnitCard';

export function EditKeyUnitCardsPart(props: {
  playerModel: IPlayerModel;
  editorModel: IEditorModel;
}) {
  const vm = makeEditKeyUnitCardsPartViewModel(
    props.playerModel,
    props.editorModel,
  );
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
