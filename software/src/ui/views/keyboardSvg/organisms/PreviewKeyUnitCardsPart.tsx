import { IKeyUnitEntry } from '~shared/defs/ProfileData';
import { PreviewKeyUnitCard } from '../molecules/PreviewKeyUnitCard';
import { h } from '~qx';

export const PreviewKeyUnitCardsPart = (props: {
  keyUnits: IKeyUnitEntry[];
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => {
  const { keyUnits, showKeyId, showKeyIndex } = props;

  return (
    <g>
      {keyUnits.map((keyUnit) => (
        <PreviewKeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.id}
          showKeyId={showKeyId}
          showKeyIndex={showKeyIndex}
          qxOptimizer="deepEqual"
        />
      ))}
    </g>
  );
};
