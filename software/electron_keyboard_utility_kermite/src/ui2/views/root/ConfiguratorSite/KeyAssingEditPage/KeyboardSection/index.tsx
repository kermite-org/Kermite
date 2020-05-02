import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { KeyUnitCardsPart } from './KeyUnitCardsPart';
import { editorModel } from '~ui2/models/zAppDomain';

export const KeyboardBasePlane = (props: { children: any }) => {
  const { clearAssignSlotSelection } = editorModel;
  const { children } = props;
  const cssSvg = css`
    user-select: none;
  `;
  const maxHeight = Math.max(((window.innerHeight / 2) >> 0) - 60, 200);
  const styleSvg = {
    'max-height': `${maxHeight}px`
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

export const KeyboardBodyShape = () => {
  const outerPaths = editorModel.bodyPathMarkupText;
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={outerPaths} css={cssBody} />;
};

export function KeyboardSection() {
  const cssSvgOuter = css`
    object-fit: contain;
  `;

  return (
    <div css={cssSvgOuter}>
      <KeyboardBasePlane>
        <KeyboardBodyShape />
        <KeyUnitCardsPart />
      </KeyboardBasePlane>
    </div>
  );
}
