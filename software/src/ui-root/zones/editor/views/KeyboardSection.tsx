import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { KeyboardBodyShape } from '~/ui-root/zones/common/parts/keyboardSvg/atoms/KeyboardBodyShape';
import { EditKeyUnitCardsPart } from '~/ui-root/zones/common/parts/keyboardSvg/organisms/EditKeyUnitCardsPart';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-root/zones/common/parts/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';
import { LayerStateView } from './LayerStateView';

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
      <EditKeyUnitCardsPart />
    </KeyboardSvgFrameWithAutoScaler>
  );
};

export function KeyboardSection() {
  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = editorModel;

  return (
    <div css={cssKeyboardSection} onMouseDown={clearAssignSlotSelection}>
      <EditKeyboardView />
      <LayerStateView />
    </div>
  );
}
