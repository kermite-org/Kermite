import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { PresetLayersBox } from '~/ui/components';
import { PresetKeyboardView } from '~/ui/components/keyboard';
import { IPresetKeyboardSectionViewModel } from '~/ui/features/PresetBrowser/viewModels';

type Props = {
  viewModel: IPresetKeyboardSectionViewModel;
};

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
