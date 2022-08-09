import { css, FC, jsx } from 'alumina';
import { IProfileData } from '~/shared';
import { texts } from '~/ui/base';
import { PresetLayersBox } from '~/ui/elements';
import { PresetKeyboardView } from '~/ui/elements/keyboard';
import { usePresetKeyboardSectionModel } from '~/ui/fabrics/presetKeyboardSection/model';

type Props = {
  profileData: IProfileData;
};

export const PresetKeyboardSection: FC<Props> = ({ profileData }) => {
  const {
    keyUnits,
    displayArea,
    outlineShapes,
    extraShape,
    layers,
    currentLayerId,
    setCurrentLayerId,
  } = usePresetKeyboardSectionModel(profileData);
  return (
    <div class={style}>
      <div class="keyboardPart">
        <PresetKeyboardView
          keyUnits={keyUnits}
          displayArea={displayArea}
          outlineShapes={outlineShapes}
          extraShape={extraShape}
        />
      </div>
      <div class="layersPart">
        <h3>{texts.presetBrowser.layers}</h3>
        <PresetLayersBox
          layers={layers}
          currentLayerId={currentLayerId}
          setCurrentLayerId={setCurrentLayerId}
          class="layersBox"
        />
      </div>
    </div>
  );
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
