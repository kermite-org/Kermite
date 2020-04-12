import { css } from 'goober';
import { hx } from '~views/basis/qx';
import { editorModule } from '~models/core/EditorModule';

export const KeyboardBasePlane = (props: { children: any }) => {
  const { clearAssignSlotSelection } = editorModule;
  const { children } = props;
  const cssSvg = css`
    user-select: none;
  `;
  return (
    <svg
      width="600"
      height="240"
      viewBox="-300 -120 600 240"
      css={cssSvg}
      onMouseDown={clearAssignSlotSelection}
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
