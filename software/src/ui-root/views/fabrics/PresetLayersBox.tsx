import { uiTheme } from '@ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { ViewModelProps } from '@ui-root/base/helper/mvvmHelpers';
import { IPrsetLayerListViewModel } from '@ui-root/viewModels/PresetKeyboardViewModel';

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
  `;

  return (
    <div css={style} onClick={onClick} data-active={isActive}>
      {layerName}
    </div>
  );
};

export const PresetLayersBox = ({
  vm,
}: ViewModelProps<IPrsetLayerListViewModel>) => {
  const cssBase = css`
    padding: 5px;
  `;

  return (
    <div css={cssBase}>
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
