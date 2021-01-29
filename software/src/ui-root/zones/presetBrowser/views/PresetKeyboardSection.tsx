import { css } from 'goober';
import { h } from 'qx';
import { PresetLayersBox } from '~/ui-root/zones/common/parts/fabrics/PresetLayersBox';
import { PresetKeyboardView } from '~/ui-root/zones/common/parts/keyboardSvg/panels/PresetKeyboardView';
import { IPresetBrowserViewModel } from '~/ui-root/zones/presetBrowser/viewModels/PresetBrowserViewModel';

const cssPresetKeyboardSection = css`
  height: 300px;
  display: flex;
  > .keyboardPart {
    flex-grow: 1;
    border: solid 1px #48a;
  }

  > .layersPart {
    flex-shrink: 0;
    width: 100px;
    border: solid 1px #48a;
    padding: 5px;
  }
`;

export const PresetKeyboardSection = (props: {
  vm: IPresetBrowserViewModel;
}) => {
  return (
    <div css={cssPresetKeyboardSection}>
      <div class="keyboardPart">
        <PresetKeyboardView vm={props.vm.keyboard} />
      </div>
      <div class="layersPart">
        <h3>Layers</h3>
        <PresetLayersBox vm={props.vm.keyboard.layerList} />
      </div>
    </div>
  );
};
