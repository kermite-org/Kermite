import { h } from 'qx';
import { IDisplayKeyEntity } from '~/shared';
import { PreviewKeyEntityCard } from '../molecules/PreviewKeyUnitCard';

export const PreviewKeyEntityCardsPart = (props: {
  keyEntities: IDisplayKeyEntity[];
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => {
  const { keyEntities, showKeyId, showKeyIndex } = props;

  return (
    <g>
      {keyEntities.map((ke) => (
        <PreviewKeyEntityCard
          keyEntity={ke}
          key={ke.keyId}
          showKeyId={showKeyId}
          showKeyIndex={showKeyIndex}
          // qxOptimizer="deepEqual"
        />
      ))}
    </g>
  );
};
