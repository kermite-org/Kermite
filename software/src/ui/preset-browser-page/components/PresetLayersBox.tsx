import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/common';
import { PresetLayerItem } from '~/ui/preset-browser-page/components/PresetLayerItem';

type Props = {
  layers: {
    layerId: string;
    layerName: string;
  }[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
};

const style = css`
  padding: 5px;
`;

export const PresetLayersBox: FC<Props> = ({
  layers,
  currentLayerId,
  setCurrentLayerId,
}) => (
  <div css={style} data-hint={texts.hint_presetBrowser_layers}>
    {layers.map((la) => (
      <PresetLayerItem
        key={la.layerId}
        layerName={la.layerName}
        isActive={la.layerId === currentLayerId}
        onClick={() => setCurrentLayerId(la.layerId)}
      />
    ))}
  </div>
);
