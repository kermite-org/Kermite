import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { PresetLayersBoxItem } from '~/ui/elements/presetBrowserParts/PresetLayersBox.Item';

type Props = {
  className?: string;
  layers: {
    layerId: string;
    layerName: string;
  }[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
};

export const PresetLayersBox: FC<Props> = ({
  className,
  layers,
  currentLayerId,
  setCurrentLayerId,
}) => (
  <div
    css={style}
    data-hint={texts.presetBrowserHint.layers}
    className={className}
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
