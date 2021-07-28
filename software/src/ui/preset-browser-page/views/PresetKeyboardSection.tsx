import { css, FC, jsx } from 'qx';
import { texts, PresetKeyboardView } from '~/ui/common';
import { PresetLayersBox } from '~/ui/preset-browser-page/components/PresetLayersBox';
import { IPresetKeyboardSectionViewModel } from '~/ui/preset-browser-page/viewModels/PresetKeyboardSectionViewModel';

type Props = {
  viewModel: IPresetKeyboardSectionViewModel;
};

const style = css`
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

    display: flex;
    flex-direction: column;
    > h3 {
      flex-shrink: 0;
    }
    > .layersBox {
      flex-grow: 1;
    }
  }
`;

export const PresetKeyboardSection: FC<Props> = ({
  viewModel: { keyboard, layerList },
}) => (
  <div css={style}>
    <div class="keyboardPart">
      <PresetKeyboardView {...keyboard} />
    </div>
    <div class="layersPart">
      <h3>{texts.label_presetBrowser_layers}</h3>
      <PresetLayersBox {...layerList} className="layersBox" />
    </div>
  </div>
);
