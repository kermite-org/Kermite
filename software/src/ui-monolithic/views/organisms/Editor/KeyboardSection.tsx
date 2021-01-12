import { uiTheme } from '@kermite/ui';
import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/models';
import { KeyboardBodyShape } from '~/views/keyboardSvg/atoms/KeyboardBodyShape';
import { EditKeyUnitCardsPart } from '~/views/keyboardSvg/organisms/EditKeyUnitCardsPart';
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
  const bodyOuterPaths = models.editorModel.bodyPathMarkupText;
  const bodyFillColor = uiTheme.colors.clKeyboardBodyFace;
  return (
    <EditKeyboardBasePlane>
      <KeyboardBodyShape
        outerPaths={bodyOuterPaths}
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
