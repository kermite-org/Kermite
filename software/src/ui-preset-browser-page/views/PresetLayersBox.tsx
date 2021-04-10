import { jsx, css } from 'qx';
import { texts, uiTheme } from '~/ui-common';
import { ViewModelProps } from '~/ui-common/helpers';
import { IPresetLayerListViewModel } from '~/ui-preset-browser-page/viewModels/PresetKeyboardViewModel';

const PresetLayerItem = (props: {
  layerName: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const { layerName, isActive, onClick } = props;

  const style = css`
    color: ${uiTheme.colors.clAltText};
    padding: 0 4px;
    user-select: none;
    cursor: pointer;
    &[data-active] {
      background: #0cc;
    }
    &:hover {
      opacity: 0.7;
    }
  `;

  return (
    <div css={style} onClick={onClick} data-active={isActive}>
      {layerName}
    </div>
  );
};

export const PresetLayersBox = ({
  vm,
}: ViewModelProps<IPresetLayerListViewModel>) => {
  const cssBase = css`
    padding: 5px;
  `;

  return (
    <div css={cssBase} data-hint={texts.hint_presetBrowser_layers}>
      {vm.layers.map((la) => (
        <PresetLayerItem
          key={la.layerId}
          layerName={la.layerName}
          isActive={la.layerId === vm.currentLayerId}
          onClick={() => vm.setCurrentLayerId(la.layerId)}
        />
      ))}
    </div>
  );
};
