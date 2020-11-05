import { css } from 'goober';
import { h } from '~lib/qx';
import { IPresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { PresetKeyboardView } from '../keyboardSvg/panels/PresetKeyboardView';

const cssPresetKeyboardSection = css`
  border: solid 1px blue;
  height: 300px;
  display: flex;
  > .keyboardPart {
    flex-grow: 1;
    border: solid 1px blue;
  }

  > .layersPart {
    flex-shrink: 0;
    width: 100px;
    border: solid 1px blue;
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
      <div class="layersPart" />
    </div>
  );
};
