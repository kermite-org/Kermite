import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { models } from '~/ui-root/models';
import { KeyboardBodyShape } from '~/ui-root/views/keyboardSvg/atoms/KeyboardBodyShape';
import { EditKeyUnitCardsPart } from '~/ui-root/views/keyboardSvg/organisms/EditKeyUnitCardsPart';
import { LayerStateView } from './LayerStateView';

const EditKeyboardBasePlane = (props: { children: any }) => {
  const { clearAssignSlotSelection } = models.editorModel;
  const { children } = props;
  const cssSvg = css`
    user-select: none;
  `;
  const maxHeight = Math.max(((window.innerHeight / 2) >> 0) - 60, 200);
  const styleSvg = {
    'max-height': `${maxHeight}px`,
  };
  return (
    <svg
      viewBox="-300 -120 600 240"
      css={cssSvg}
      onMouseDown={clearAssignSlotSelection}
      style={styleSvg}
    >
      <g
        transform="scale(2) translate(0, -53.5)"
        strokeWidth={0.3}
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
};

const EditKeyboardView = () => {
  const outlineShapes = models.editorModel.displayDesign.outlineShapes;
  const bodyFillColor = uiTheme.colors.clKeyboardBodyFace;
  return (
    <EditKeyboardBasePlane>
      <KeyboardBodyShape
        outlineShapes={outlineShapes}
        fillColor={bodyFillColor}
        strokeColor="transparent"
      />
      <EditKeyUnitCardsPart />
    </EditKeyboardBasePlane>
  );
};

export function KeyboardSection() {
  const cssKeyboardSection = css`
    object-fit: contain;
    position: relative;
  `;

  return (
    <div css={cssKeyboardSection}>
      <EditKeyboardView />
      <LayerStateView />
    </div>
  );
}
