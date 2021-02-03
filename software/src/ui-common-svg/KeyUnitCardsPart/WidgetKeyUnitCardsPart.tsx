import { h } from 'qx';
import { IWidgetKeyUnitCardsPartViewModel } from '~/ui-common-svg/KeyUnitCardsPart/WidgetKeyUnitCardsPartViewModel';
import { WidgetKeyUnitCard } from '../KeyUnitCards/WidgetKeyUnitCard';

export function WidgetKeyUnitCardsPart(props: {
  vm: IWidgetKeyUnitCardsPartViewModel;
}) {
  return (
    <g>
      {props.vm.cards.map((keyUnit) => (
        <WidgetKeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          // qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
