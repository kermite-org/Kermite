import { h } from '~lib/qx';
import { IKeyUnitEntry } from '~defs/ProfileData';
import { PreviewKeyUnitCard } from '../molecules/PreviewKeyUnitCard';

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
