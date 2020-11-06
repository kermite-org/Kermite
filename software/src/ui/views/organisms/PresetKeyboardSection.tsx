import { css } from 'goober';
import { h } from '~lib/qx';
import { IPresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { PresetLayersBox } from '~ui/views/fabrics/PresetLayersBox';
import { PresetKeyboardView } from '../keyboardSvg/panels/PresetKeyboardView';

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
