import { css, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { PresetLayersBoxItem } from './PresetLayersBox.Item';

type Props = {
  layers: {
    layerId: string;
    layerName: string;
  }[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
};

export const PresetLayersBox: FC<Props> = ({
  layers,
  currentLayerId,
  setCurrentLayerId,
}) => (
  <div
    class={style}
    data-hint={texts.presetBrowserHint.layers}
    onClick={() => setCurrentLayerId('')}
  >
    {layers.reverse().map((la) => (
      <PresetLayersBoxItem
        key={la.layerId}
        layerName={la.layerName}
        isActive={la.layerId === currentLayerId}
        onClick={() => setCurrentLayerId(la.layerId)}
      />
    ))}
  </div>
);

const style = css`
  padding: 5px;
`;
