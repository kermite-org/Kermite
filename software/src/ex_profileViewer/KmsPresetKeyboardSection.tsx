import { css, FC, jsx } from 'alumina';
import { KmsPresetKeyboardView } from '~/ex_profileViewer/KmsPresetKeyboardView';
import { KmsPresetLayersBox } from '~/ex_profileViewer/KmsPresetLayersBox';
import { IPresetKeyboardSectionModel } from '~/ui/fabrics/PresetKeyboardSection/model';

type Props = {
  className?: string;
  viewModel: IPresetKeyboardSectionModel;
};

const style = css`
  height: 300px;
  display: flex;
  > .keyboardPart {
    flex-grow: 1;
  }

  > .layersPart {
    flex-shrink: 0;
    width: 100px;
    margin-right: 10px;
    height: 100%;
  }
`;

export const KmsPresetKeyboardSection: FC<Props> = ({
  className,
  viewModel: {
    keyUnits,
    displayArea,
    outlineShapes,
    layers,
    currentLayerId,
    setCurrentLayerId,
  },
}) => (
  <div css={style} className={className}>
    <div class="keyboardPart">
      <KmsPresetKeyboardView
        keyUnits={keyUnits}
        displayArea={displayArea}
        outlineShapes={outlineShapes}
      />
    </div>
    <div class="layersPart">
      <KmsPresetLayersBox
        layers={layers}
        currentLayerId={currentLayerId}
        setCurrentLayerId={setCurrentLayerId}
      />
    </div>
  </div>
);
