import { css, FC, jsx } from 'alumina';
import { KmsPresetLayerItem } from '~/ex_profileViewer/KmsPresetLayerItem';

type Props = {
  layers: {
    layerId: string;
    layerName: string;
  }[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
};

const style = css`
  padding: 3px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  > * + * {
    margin-top: 7px;
  }
`;

export const KmsPresetLayersBox: FC<Props> = ({
  layers,
  currentLayerId,
  setCurrentLayerId,
}) => (
  <div class={style} onClick={() => setCurrentLayerId('')}>
    {layers.reverse().map((la) => (
      <KmsPresetLayerItem
        key={la.layerId}
        layerName={la.layerName}
        isActive={la.layerId === currentLayerId}
        onClick={() => setCurrentLayerId(la.layerId)}
      />
    ))}
  </div>
);
