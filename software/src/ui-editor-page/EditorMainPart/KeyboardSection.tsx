import { css } from 'goober';
import { h, Hook } from 'qx';
import { uiTheme } from '~/ui-common';
import { PlayerModel } from '~/ui-common/sharedModels/PlayerModel';
import { KeyboardBodyShape } from '~/ui-common/sharedViews/keyboardSvg/KeyboardBodyShape';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-common/sharedViews/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';
import { EditKeyUnitCardsPart } from '~/ui-editor-page/EditorMainPart/views/EditKeyUnitCardsPart';
import { LayerStateView } from './views/LayerStateView';

const playerModel = new PlayerModel();

const EditKeyboardView = () => {
  const design = editorModel.displayDesign;
  const bodyFillColor = uiTheme.colors.clKeyboardBodyFace;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;
  return (
    <KeyboardSvgFrameWithAutoScaler
      displayArea={design.displayArea}
      dpiScale={dpiScale}
      marginRatio={marginRatio}
      baseStrokeWidth={baseStrokeWidth}
    >
      <KeyboardBodyShape
        outlineShapes={design.outlineShapes}
        fillColor={bodyFillColor}
        strokeColor="transparent"
      />
      <EditKeyUnitCardsPart playerModel={playerModel} />
    </KeyboardSvgFrameWithAutoScaler>
  );
};

export function KeyboardSection() {
  Hook.useEffect(() => {
    playerModel.initialize();
    return () => playerModel.finalize();
  }, []);

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = editorModel;

  return (
    <div css={cssKeyboardSection} onMouseDown={clearAssignSlotSelection}>
      <EditKeyboardView />
      <LayerStateView playerModel={playerModel} />
    </div>
  );
}
